const express = require("express");
const router = express.Router();
const validate  = require("../middleware/validate.middleware.js")
const {registerSchema, loginSchema} = require("../validators/auth.validator.js")
const {register,login,getMe} = require("../controllers/auth.controller.js");
const {protect} = require("../middleware/auth.middleware.js")

router.route("/register").post(validate(registerSchema),register);
router.route("/login").post(validate(loginSchema),login);
router.route("/me").get(protect,getMe);

module.exports = router;