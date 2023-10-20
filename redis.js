if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Redis = require("ioredis");

const redisClient = new Redis(6379);

module.exports = redisClient;
