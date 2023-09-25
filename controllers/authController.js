const bcrypt = require("bcrypt");

const userQueries = require("../database/userQueries");

const handleSignUp = async (req, res) => {
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
      const user = await userQueries.getUser(req.body.email);
      req.session.authenticated = true;
      req.session.user = {
        id: user._id,
        name: user.name,
        email: user.email,
      };
      res.json({ loggedIn: true, username: req.body.email });
      console.log("signup was successful");
    }
  }
};

const handleLogin = async (req, res) => {
  const existingUser = await userQueries.getUser(req.body.email);
  if (existingUser) {
    const isSamePass = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (isSamePass) {
      req.session.authenticated = true;
      req.session.user = {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      };
      res.json({ loggedIn: true, username: req.body.email });
      console.log("login was successful");
    } else {
      res.json({
        loggedIn: false,
        status: "Your email or password is incorrect.",
      });
      console.log("Login failed");
    }
  } else {
    res.json({
      loggedIn: false,
      status: "Your email or password is incorrect.",
    });
    console.log("Login failed");
  }
};

module.exports = { handleLogin, handleSignUp };