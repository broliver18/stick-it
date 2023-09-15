const express = require("express");
const router = express.Router();
const Yup = require("yup");
const validateForm = require("../controllers/validateForm");

const loginSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email address"),
  password: Yup.string()
    .required("Password required")
    .min(8, "Password is too short"),
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

router.post("/login", (req, res) => {
  validateForm(req, res, loginSchema);
});

router.post("/register", (req, res) => {
  validateForm(req, res, registerSchema);
});

module.exports = router;
