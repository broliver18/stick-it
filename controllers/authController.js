const bcrypt = require("bcrypt");

const userQueries = require("../database/userQueries");

const handleSignUp = async (req, res, next) => {
  const existingUser = await userQueries.getUser(req.body.email);
  if (existingUser) {
    res.json({ loggedIn: false, status: "This email is already registered." });
    console.log("email already registered");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await userQueries.createUser(
      req.body.name,
      req.body.email,
      hashedPassword
    );
    if (newUser === "success") {
      return next();
    }
  }
};

const handleLogin = async (req, res) => {
  const names = req.user.name.split(" ");
  res.json({ loggedIn: true, username: names[0] });
  console.log("login was successful");
};

module.exports = { handleLogin, handleSignUp };
