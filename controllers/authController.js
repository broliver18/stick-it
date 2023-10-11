if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bcryptSalt = process.env.BCRYPT_SALT;

const bcrypt = require("bcrypt");

const userQueries = require("../database/userQueries");
const Token = require("../models/token");

const handleSignUp = async (req, res, next) => {
  const existingUser = await userQueries.getUser(req.body.email);
  if (existingUser) {
    res.json({ loggedIn: false, status: "This email is already registered." });
    console.log("email already registered");
  } else {
    const hashedPassword = await bcrypt.hash(
      req.body.password,
      Number(bcryptSalt)
    );
    const newUserStatus = await userQueries.createUser(
      req.body.name,
      req.body.email,
      hashedPassword
    );
    if (newUserStatus === "success") {
      return next();
    }
  }
};

const handleLogin = (req, res) => {
  const names = req.user.name.split(" ");
  res.json({ loggedIn: true, username: names[0] });
  console.log("login was successful");
};

const handleLogout = (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    console.log("logout was successful");
    res.json("success");
  });
};

const checkLogin = (req, res) => {
  if (req.user) {
    const names = req.user.name.split(" ");
    res.json({ loggedIn: true, username: names[0] });
  } else {
    res.json("not logged in");
  }
};

const requestResetToken = async (req, res) => {
  const user = await userQueries.getUser(req.body.email);
  if (!user) {
    res.json("no user found");
    return;
  }
  const token = await Token.findOne({ userId: user._id });
  if (token) await Token.deleteOne();
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
  }).save();
};

const verifyToken = async (req, res) => {
  const userInputResetToken = req.body.resetCode;
  const passwordResetToken = await Token.findOne({
    token: userInputResetToken,
  });
  const invalidMessage = "Invalid or expired password reset code.";
  if (!passwordResetToken) {
    res.json(invalidMessage);
    return;
  }
  const isValid = await bcrypt.compare(
    userInputResetToken,
    passwordResetToken.token
  );
  if (!isValid) {
    res.json(invalidMessage);
  } else {
    res.json(passwordResetToken.userId);
  }
};

const resetPassword = async (req, res) => {
  const userId = req.params.id;
  const user = await userQueries.getUserById(userId);
  user.password = req.body.password;
  await user.save();
};

const checkAuthentication = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
};

module.exports = {
  handleSignUp,
  handleLogin,
  handleLogout,
  checkLogin,
  checkAuthentication,
};
