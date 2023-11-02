const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;
const userQueries = require("../database/userQueries");

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    const user = await userQueries.getUser(email);
    if (!user) {
      return done(null, false, {
        message: "The email or password is incorrect",
      });
    }

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: "The email or password is incorrect",
        });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email", session: false }, authenticateUser));
}

module.exports = initialize;
