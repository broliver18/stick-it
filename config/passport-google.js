if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const userQueries = require("../database/userQueries");
const User = require("../models/user");

function initialize(passport) {
  const googleClientInfo = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/redirect",
  };

  const passportCallback = async (
    accessToken,
    refreshToken,
    profile,
    done
  ) => {
    const email = profile.emails[0].value;
    const existingUser = await User.findOne({ googleId: profile.id })
    if (existingUser) {
      console.log(`user: ${existingUser.name} successfully retrieved`);
      done(null, existingUser);
    } else {
      new User({
        googleId: profile.id,
        name: profile.displayName,
        email,
      })
        .save()
        .then((newUser) => {
          console.log("New user created using Google OAuth 2.0");
          done(null, newUser);
        });
    }
  };

  passport.use(new GoogleStrategy(googleClientInfo, passportCallback));
}

module.exports = initialize;
