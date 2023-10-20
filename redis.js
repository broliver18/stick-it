if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const Redis = require("ioredis");

const redisClient = new Redis({ 
    port: 6379,
    host: "162.243.175.89",
    username: "default",
    password: process.env.REDIS_PASSWORD, 
});

module.exports = redisClient;
