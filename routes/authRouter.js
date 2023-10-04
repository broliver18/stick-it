const express = require("express");
const passport = require("passport");
const router = express.Router();
const Yup = require("yup");

const validateForm = require("../controllers/validateForm");
const { handleSignUp, handleLogin, handleLogout } = require("../controllers/authController");
const { rateLimiter } = require("../controllers/rateLimiter");

const loginSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email address"),
  password: Yup.string().required("Password required"),
});

const signUpSchema = Yup.object({
  name: Yup.string().required("Name requried"),
  email: Yup.string().required("Email required").email("Invalid email address"),
  password: Yup.string()
    .required("Password required")
    .min(8, "Password is too short"),
  confirmPassword: Yup.string()
    .required("Confirm password required")
    .oneOf([Yup.ref("password"), null], "Passwords must match"),
});

router.post("/sign-up", validateForm(signUpSchema), rateLimiter, handleSignUp, passport.authenticate("local"), handleLogin);
router.post("/login", validateForm(loginSchema), rateLimiter, passport.authenticate("local"), handleLogin,);
router.get("/logout", handleLogout);

module.exports = router;