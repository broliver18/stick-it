if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const bcrypt = require("bcrypt");
const bcryptSalt = process.env.BCRYPT_SALT;

const userQueries = require("../database/userQueries");
const Token = require("../models/token");
const { sendWelcome, sendResetToken, sendResetConfirmation } = require("../service/automatedEmails");

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
      sendWelcome(req.body.email).catch(console.error);
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
  if (!user || !user.password) {
    const message = "no user found";
    console.log(message);
    res.json(message);
    return;
  }
  const token = await Token.findOne({ userId: user._id });
  if (token) await Token.deleteOne({ userId: user._id });
  const resetTokenNum = Math.floor(Math.random() * 90000) + 10000;
  const resetToken = resetTokenNum.toString();
  const hashedToken = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
  }).save();

  console.log("token successfully created");
  console.log(resetToken);
  sendResetToken(user.email, resetToken).catch(console.error);
  res.json(user._id);
};

const verifyToken = async (req, res) => {
  const userId = req.params.id;
  const userInputResetToken = req.query.token;
  const passwordResetToken = await Token.findOne({
    userId,
  });
  const invalidMessage = "Invalid or expired password reset code.";
  if (!passwordResetToken) {
    console.log(invalidMessage);
    res.json(invalidMessage);
    return;
  }
  const isValid = await bcrypt.compare(
    userInputResetToken,
    passwordResetToken.token
  );
  if (!isValid) {
    console.log(invalidMessage);
    res.json(invalidMessage);
  } else {
    console.log("tokens match");
    res.json("success");
  }
};

const resetPassword = async (req, res) => {
  const userId = req.params.id;
  const user = await userQueries.getUserById(userId);
  const newPassword = req.body.newPassword;
  const hashedNewPassword = await bcrypt.hash(newPassword, Number(bcryptSalt));
  user.password = hashedNewPassword;
  await user.save();

  await Token.deleteOne({ userId });
  console.log("password successfully changed")
  sendResetConfirmation(user.email).catch(console.error);
  res.json("success");
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
  requestResetToken,
  verifyToken,
  resetPassword,
  checkAuthentication,
};
