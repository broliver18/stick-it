const Redis = require("ioredis");

const redisClient = new Redis(6379);

module.exports = redisClient;
