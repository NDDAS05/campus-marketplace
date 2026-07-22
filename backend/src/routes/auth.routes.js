const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate.middleware.js");
const { registerSchema, loginSchema, googleAuthSchema } = require("../validators/auth.validator.js");
const { register, login, getMe, logout, googleLogin } = require("../controllers/auth.controller.js");
const { isLoggedIn } = require("../middleware/auth.middleware.js");

router.route("/register").post(validate(registerSchema), register);
router.route("/login").post(validate(loginSchema), login);
router.route("/google").post(validate(googleAuthSchema), googleLogin);
router.route("/me").get(isLoggedIn, getMe);
router.route("/logout").post(logout);

module.exports = router;