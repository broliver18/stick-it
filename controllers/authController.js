const bcrypt = require("bcrypt");

const userController = require("../controllers/databaseControllers/userController");

module.exports.handleSignUp = async (req, res) => {
  const existingUser = await userController.getUser(req.body.email);
  if (existingUser) {
    res.json({ loggedIn: false, status: "Email already registered" });
    console.log("email already registered");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await userController.createUser(
      req.body.name,
      req.body.email,
      hashedPassword
    );
    if (newUser === "success") {
      const user = await userController.getUser(req.body.email);
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

module.exports.handleLogin = async (req, res) => {
  const existingUser = await userController.getUser(req.body.email);
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
