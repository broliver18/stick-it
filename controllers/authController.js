const bcrypt = require("bcrypt");

const userQueries = require("../database/userQueries");

const handleSignUp = async (req, res, next) => {
  const existingUser = await userQueries.getUser(req.body.email);
  if (existingUser) {
    res.json({ loggedIn: false, status: "This email is already registered." });
    console.log("email already registered");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
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

const handleLoginFailure = (req, res) => {
  res
    .status(401)
    .send(
      "Authentication failed: It looks like you already created in account with the same email address using a different sign-up method."
    );
};

const checkLogin = (req, res) => {
  if (req.user) {
    const names = req.user.name.split(" ");
    res.json({ loggedIn: true, username: names[0] });
  } else {
    res.json("not logged in");
  }
};

const passwordResetCodeGenerator = () =>
  Math.floor(Math.random() * 90000) + 10000;

const sendResetCode = async (req, res) => {
  const userEmail = req.body.email;
  const user = await userQueries.getUser(userEmail);
  if (!user || !user.password) {
    return;
  }
  const resetCode = passwordResetCodeGenerator();
  console.log(resetCode);
  req.session.resetCodeInfo = {
    userEmail,
    resetCode,
  };
  setTimeout(() => {
    req.session.resetCodeInfo = null;
  }, 1000 * 60 * 5);
};

const checkResetCode = (req, res) => {
  if (!req.session.resetCodeInfo) {
    res.json("time expired");
  } else {
    if (req.body.resetCode === req.session.resetCodeInfo.resetCode) {
      res.json("code matches");
    } else {
      res.json("code does not match");
    }
  }
};

const resetPassword = async (req, res) => {
  const { resetCodeInfo } = req.session;
  const { userEmail } = resetCodeInfo;
  const newPassword = req.body.newPassword;
  const user = await userQueries.getUser(userEmail);
  if (
    newPassword === user.password ||
    user.previousPasswords.find((oldPassword) => oldPassword === newPassword)
  ) {
    res.json("password is equal to previous password");
  } else {
    user.previousPasswords.push(user.password);
    user.password = newPassword;
    await user.save()
    res.json("success");
  }
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
  handleLoginFailure,
  checkLogin,
  checkAuthentication,
};
