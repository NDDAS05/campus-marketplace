const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const wrapAsync = require("../utils/wrapAsync.js");


const isLoggedIn = wrapAsync(async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }
    req.user = user;
    next();
});

const attachUserIfPresent = wrapAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(); // no cookie — proceed as logged-out, don't error

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch {
    // invalid/expired token — treat as logged-out rather than erroring
  }
  next();
});

module.exports = { isLoggedIn, attachUserIfPresent };