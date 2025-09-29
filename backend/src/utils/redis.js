const redis = require('redis');
require('dotenv').config();

let redisClient;

(async () => {
  try {
    redisClient = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
      },
    });

    redisClient.on('error', (err) =>
      console.error('❌ Redis Client Error:', err)
    );

    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
  }
})();


const setCache = async (key, value, ttl = 900) => {
  try {
    await redisClient.set(key, JSON.stringify(value), {
      EX: ttl, // Expire after ttl seconds
    });
     
  } catch (error) {
    console.error('Redis setCache error:', error);
  }
};


const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    console.log("get cache mei aaya")
    return data ? JSON.parse(data) : null;
    
  } catch (error) {
    console.error('Redis getCache error:', error);
    return null;
  }
};


const deleteCache = async (key) => {
  try {
    await redisClient.del(key);

  } catch (error) {
    console.error('Redis deleteCache error:', error);
  }
};


const clearCache = async () => {
  try {
    await redisClient.flushAll();
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
