require("dotenv").config();


const redisClient = require("../redis");
const RedisStore = require("connect-redis").default;
const session = require("express-session");

const corsConfig = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET,
  credentials: true,
  name: "sid",
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : "auto",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

module.exports = { sessionMiddleware, corsConfig };