const express = require("express");
const router = express.Router();
const Yup = require("yup");
const bcrypt = require("bcrypt");
const validateForm = require("../controllers/validateForm");
const userController = require("../controllers/userController");

const loginSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email address"),
  password: Yup.string()
    .required("Password required"),
});

const registerSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email address"),
  password: Yup.string()
    .required("Password required")
    .min(8, "Password is too short"),
  confirmPassword: Yup.string()
    .required("Confirm password required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

router.post("/login", async (req, res) => {
  validateForm(req, res, loginSchema);

  const existingUser = await userController.getUser(req.body.email);
  if (existingUser) {
    const isSamePass = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );
    if (isSamePass) {
      req.session.user = {
        id: existingUser._id,
        email: existingUser.email,
      };
      res.json({ loggedIn: true, username: req.body.email });
      console.log("login was successful")
    } else {
      res.json({ loggedIn: false, status: "Wrong username or password" });
      console.log("Login failed")
    }
  } else {
    res.json({ loggedIn: false, status: "Wrong username or password" });
    console.log("Login failed")
  }
});

router.post("/sign-up", async (req, res) => {
  validateForm(req, res, registerSchema);

  const existingUser = await userController.getUser(req.body.email);
  if (existingUser) {
    res.json({ loggedIn: false, status: "Email already registered" });
    console.log("email already registered")
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await userController.createUser(
      req.body.email,
      hashedPassword
    );
    if (newUser === "success") {
      const user = await userController.getUser(req.body.email);
      req.session.user = {
        id: user._id,
        email: user.email,
      };
      res.json({ loggedIn: true, username: req.body.email });
      console.log("signup was successful")
    }
  }
});

module.exports = router;
