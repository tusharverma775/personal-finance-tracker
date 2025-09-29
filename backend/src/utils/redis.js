const { Redis } = require('@upstash/redis');
const redisLib = require('redis');
require('dotenv').config();

let redis;

// If in development → use local redis (node-redis)
// If in production → use Upstash
if (process.env.NODE_ENV === 'development') {
  (async () => {
    try {
      redis = redisLib.createClient({
        socket: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: process.env.REDIS_PORT || 6379,
        },
      });

      redis.on('error', (err) => console.error('❌ Redis Client Error:', err));

      await redis.connect();
      console.log('✅ Local Redis connected successfully');
    } catch (error) {
      console.error('❌ Local Redis connection failed:', error);
    }
  })();
} else {
  redis = new Redis({
    url: process.env.REDIS_URL,   // e.g. Upstash endpoint
    token: process.env.REDIS_TOKEN, // Upstash token
  });
  console.log('✅ Using Upstash Redis in production');
}

// ----- Wrapper functions -----
const setCache = async (key, value, ttl = 900) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await redis.set(key, JSON.stringify(value), { EX: ttl });
    } else {
      await redis.set(key, JSON.stringify(value), { ex: ttl });
    }
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
};

const getCache = async (key) => {
  try {
    const data = await redis.get(key);
    console.log('getCache called');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
};

const clearCache = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await redis.flushAll();
    } else {
      await redis.flushall();
    }
  } catch (error) {
    console.error('Redis clearCache error:', error);
  }
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  clearCache,
};
