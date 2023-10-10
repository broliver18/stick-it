const express = require("express");
const passport = require("passport");
const router = express.Router();
const Yup = require("yup");

const CLIENT_LOGIN_PAGE_URL = "http://localhost:3000/host";
const SERVER_LOGIN_FAILURE = "http://localhost:3000/login";

const validateForm = require("../controllers/validateForm");
const {
  handleSignUp,
  handleLogin,
  handleLogout,
  checkLogin,
} = require("../controllers/authController");
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

router.post(
  "/sign-up",
  validateForm(signUpSchema),
  rateLimiter,
  handleSignUp,
  passport.authenticate("local"),
  handleLogin
);
router
  .route("/login")
  .post(
    validateForm(loginSchema),
    rateLimiter,
    passport.authenticate("local"),
    handleLogin
  )
  .get(checkLogin);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    successRedirect: CLIENT_LOGIN_PAGE_URL,
    failureRedirect: SERVER_LOGIN_FAILURE,
  }),
  handleLogin
);
router.get(
  "/facebook",
  passport.authenticate("facebook", { authType: 'reauthenticate', scope: ["public_profile", "email"] })
);
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    successRedirect: CLIENT_LOGIN_PAGE_URL,
    failureRedirect: SERVER_LOGIN_FAILURE,
  })
);
router.get("/logout", handleLogout);

module.exports = router;
