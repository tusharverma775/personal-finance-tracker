const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });

client.connect().catch(console.error);

/**
 * cache middleware for GET endpoints
 * keyBuilder: (req) => 'some:key'
 * ttlSeconds: number
 */
const cacheMiddleware = (keyBuilder, ttlSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const key = keyBuilder(req);
      const cached = await client.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      // hijack res.json to set cache before sending
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        try {
          await client.setEx(key, ttlSeconds, JSON.stringify(body));
        } catch (e) { console.error('Redis set error', e); }
        return originalJson(body);
      };
      next();
    } catch (err) {
      console.error('Cache middleware error', err);
      next();
    }
  };
};

const invalidateKeys = async (pattern) => {
  try {
    // Redis v6+ supports SCAN/KEYS — careful in production
    const keys = [];
    for await (const k of client.scanIterator({ MATCH: pattern })) keys.push(k);
    if (keys.length) await client.del(keys);
  } catch (err) {
    console.error('Failed to invalidate cache', err);
  }
};
 
module.exports = { cacheMiddleware, invalidateKeys, redisClient: client };
