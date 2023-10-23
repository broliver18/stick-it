require("dotenv").config();


const FacebookStrategy = require("passport-facebook").Strategy;

const User = require("../models/user");

function initialize(passport) {
  const facebookClientInfo = {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL}/auth/facebook/redirect`,
    profileFields: ["displayName", "email"],
  };

  const passportCallback = async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const existingUser = await User.findOne({ facebookId: profile.id });
    if (existingUser) {
      console.log(`user: ${existingUser.name} successfully retrieved`);
      done(null, existingUser);
    } else {
      const duplicateEmailUser = await User.findOne({ email });
      if (duplicateEmailUser) {
        return done(null, false);
      } else {
        new User({
          name: profile.displayName,
          facebookId: profile.id,
          email,
        })
          .save()
          .then((newUser) => {
            console.log("New user created using Facebook OAuth 2.0");
            done(null, newUser);
          });
      }
    }
  };

  passport.use(new FacebookStrategy(facebookClientInfo, passportCallback));
}

module.exports = initialize;
