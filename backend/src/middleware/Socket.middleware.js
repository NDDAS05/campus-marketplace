const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");

// Socket.io's handshake carries raw cookie header text, not a parsed object
// (that's cookie-parser's job for Express, which doesn't run here). Minimal
// parser so we don't need to add a new dependency just for this.
function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return acc;
    const key = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

// Registered with io.use(...). Runs once per connection attempt, before
// "connection" fires. Rejecting here means the client's `connect_error`
// event fires client-side instead of a bare disconnect.
async function socketAuth(socket, next) {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) {
      return next(new Error("Not authenticated"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("User no longer exists"));
    }

    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Not authenticated"));
  }
}

module.exports = { socketAuth };