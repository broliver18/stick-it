const Redis = require("ioredis");

const redisClient = new Redis(6379, "162.243.175.89");

module.exports = redisClient;