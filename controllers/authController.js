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
  res.status(401).send("Authentication failed: It looks like you already created in account with the same email address using a different sign-up method.");
};

const checkLogin = (req, res) => {
  if (req.user) {
    const names = req.user.name.split(" ");
    res.json({ loggedIn: true, username: names[0] });
  } else {
    res.json("not logged in");
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
