const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const wrapAsync = require("../utils/wrapAsync.js");

// Completely separate from isLoggedIn — checks a different cookie, signed
// with a different secret, and additionally requires role: "admin".
const isAdmin = wrapAsync(async (req, res, next) => {
  const token = req.cookies.admin_token;
  if (!token) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Admin access denied" });
  }

  req.admin = user;
  next();
});

module.exports = { isAdmin };