const passport = require("passport");

const authenticateLocal = (req, res, next) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = authenticateLocal;