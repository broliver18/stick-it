const express = require("express");
const router = express.Router();
const Yup = require("yup");

const validateForm = require("../controllers/validateForm");
const { handleLogin, handleSignUp } = require("../controllers/authController");

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

router.post("/sign-up", validateForm(signUpSchema), handleSignUp );
router.post("/login", validateForm(loginSchema), handleLogin);

module.exports = router;
