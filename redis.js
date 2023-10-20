if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Redis = require("ioredis");

const redisClient = new Redis({
  port: 6379,
  host: "127.0.0.1",
  username: "default",
  password: process.env.REDIS_PASSWORD,
});

module.exports = redisClient;
