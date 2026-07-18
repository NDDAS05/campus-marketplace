const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const wrapAsync = require("../utils/wrapAsync");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = wrapAsync(async (req, res) => {
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, name, sub: googleId, email_verified } = payload;

  if (!email_verified) {
    return res.status(400).json({ message: "Google email not verified" });
  }

  // Same domain restriction as regular signup
  const allowedDomain = "students.iiests.ac.in";
  if (!email.endsWith(`@${allowedDomain}`)) {
    return res.status(400).json({ message: "Only IIEST Shibpur student emails are allowed" });
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (user) {
    // Email already registered the normal way — don't silently merge accounts
    if (user.authProvider !== "google") {
      return res.status(400).json({
        message: "An account with this email already exists. Please log in with your password instead.",
      });
    }
  } else {
    // First time — create the account. Derive a unique username from the email.
    const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 20) || "user";
    let username = base;
    let suffix = 0;
    while (await User.findOne({ username })) {
      suffix += 1;
      username = `${base}${suffix}`;
    }

    user = await User.create({
      name,
      username,
      email,
      googleId,
      authProvider: "google",
    });
  }

  const token = signToken(user._id);
  sendTokenCookie(res, token);

  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
  });
});


const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

const sendTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

exports.register = wrapAsync(async (req, res, next) => {
  console.log(req.body);
    const { name, username, email, password, college, year, semester, stream } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: "Email or username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check added: only iiest stds can register.
    const allowedDomain = "students.iiests.ac.in";
    if (!email.endsWith(`@${allowedDomain}`)) {
      return res.status(400).json({ 
        message: "Only IIEST Shibpur student emails are allowed" 
      });
    }
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      college,
      year,
      semester,
      stream, // Added for better suggestion (suggesting a ME std ME items and not CST/IT items)
      authProvider: "local",
    });

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
});

exports.login = wrapAsync( async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.authProvider !== "local") {
      return res.status(400).json({
        message: `This account uses ${user.authProvider} login. Please sign in that way.`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signToken(user._id);
    sendTokenCookie(res, token);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
});


exports.getMe = wrapAsync(async (req, res, next) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      username: req.user.username,
      email: req.user.email,
    },
  });
});
exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};