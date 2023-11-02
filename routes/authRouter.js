require("dotenv").config();

const express = require("express");
const passport = require("passport");
const authenticateLocal = require("../controllers/authenticateLocal");
const router = express.Router();
const Yup = require("yup");

const { validateForm } = require("../controllers/validateForm");
const {
  handleSignUp,
  handleLogin,
  handleLogout,
  checkLogin,
  requestResetToken,
  verifyToken,
  resetPassword,
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

const requestResetTokenSchema = Yup.object({
  email: Yup.string().required("Email required").email("Invalid email address"),
});

const resetPasswordSchema = Yup.object({
  newPassword: Yup.string()
    .required("Password required")
    .min(8, "The password is too short"),
  confirmPassword: Yup.string()
    .required("Confirm password required")
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
});

router.post(
  "/sign-up",
  validateForm(signUpSchema),
  rateLimiter,
  handleSignUp,
  authenticateLocal,
  handleLogin
);
router
  .route("/login")
  .post(validateForm(loginSchema), rateLimiter, authenticateLocal, handleLogin)
  .get(checkLogin);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/redirect",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateJWT();
    res.cookie("x-auth-cookie", token);
    res.redirect(`${process.env.CLIENT_URL}/host`);
  }
);
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    authType: "reauthenticate",
    scope: ["public_profile", "email"],
  })
);
router.get(
  "/facebook/redirect",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_URL}/login`,
    session: false,
  }),
  (req, res) => {
    const token = req.user.generateJWT();
    res.cookie("x-auth-cookie", token);
    res.redirect(`${process.env.CLIENT_URL}/host`);
  }
);
router.post(
  "/requestToken",
  validateForm(requestResetTokenSchema),
  requestResetToken
);
router.get("/verifyToken/:id", verifyToken);
router.put(
  "/reset-password/:id",
  validateForm(resetPasswordSchema),
  resetPassword
);
router.get("/logout", handleLogout);

module.exports = router;
