const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const { User } = require("../models/User.js");
const { Listing } = require("../models/Listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signAdminToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.ADMIN_JWT_SECRET, {
    expiresIn: process.env.ADMIN_JWT_EXPIRE,
  });
};

const sendAdminTokenCookie = (res, token) => {
  res.cookie("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

// ============================================================
// AUTH
// ============================================================

exports.adminGoogleLogin = wrapAsync(async (req, res) => {
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  const { email, email_verified } = payload;

  if (!email_verified) {
    return res.status(400).json({ message: "Google email not verified" });
  }

  const allowedAdminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedAdminEmails.includes(email.toLowerCase())) {
    return res.status(403).json({ message: "Access denied" });
  }

  const user = await User.findOne({ email, role: "admin" });
  if (!user) {
    return res.status(403).json({ message: "Access denied" });
  }

  const token = signAdminToken(user._id);
  sendAdminTokenCookie(res, token);

  res.status(200).json({
    admin: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
});

exports.getAdminMe = wrapAsync(async (req, res) => {
  res.status(200).json({
    admin: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

exports.adminLogout = (req, res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// ============================================================
// LISTING MODERATION
// ============================================================

exports.getPendingListings = wrapAsync(async (req, res) => {
  const listings = await Listing.find({ status: "Under Review" })
    .sort({ updatedAt: -1 })
    .populate("seller", "name username email");
  res.status(200).json({ listings });
});

exports.getListingHistory = wrapAsync(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : { status: { $in: ["Listed", "Rejected"] } };
  const listings = await Listing.find(filter)
    .sort({ updatedAt: -1 })
    .limit(100)
    .populate("seller", "name username email");
  res.status(200).json({ listings });
});

exports.approveListing = wrapAsync(async (req, res) => {
  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, status: "Under Review" },
    { status: "Listed", moderationReason: null },
    { new: true }
  );
  if (!listing) {
    return res.status(404).json({ message: "Listing not found or not under review" });
  }
  res.status(200).json({ message: "Listing approved", listing });
});

exports.rejectListing = wrapAsync(async (req, res) => {
  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, status: "Under Review" },
    { status: "Rejected" },
    { new: true }
  );
  if (!listing) {
    return res.status(404).json({ message: "Listing not found or not under review" });
  }
  res.status(200).json({ message: "Listing rejected", listing });
});

// ============================================================
// COMMENT MODERATION
// ============================================================

// Sorted by report count, descending. Permanently excludes any comment
// an admin has already dismissed — count keeps rising, queue never reopens.
exports.getReportedComments = wrapAsync(async (req, res) => {
  const listings = await Listing.find({ "comments.isDeleted": false })
    .populate("comments.user", "name username")
    .select("title comments seller");

  const reported = [];
  for (const listing of listings) {
    for (const comment of listing.comments) {
      const reportCount = comment.dislikedBy.length;
      if (reportCount >= 5 && !comment.isDeleted && !comment.reportDismissed) {
        reported.push({
          listingId: listing._id,
          listingTitle: listing.title,
          commentId: comment._id,
          text: comment.text,
          user: comment.user,
          reportCount,
          createdAt: comment.createdAt,
        });
      }
    }
  }

  reported.sort((a, b) => b.reportCount - a.reportCount);
  res.status(200).json({ comments: reported });
});

exports.adminDeleteComment = wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Listing not found" });

  const comment = listing.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.text = "This message has been deleted by Admin";
  comment.isDeleted = true;

  await listing.save();
  res.status(200).json({ message: "Comment deleted by admin" });
});

// Permanent dismiss — reports on this comment keep counting, but it
// never re-enters the queue regardless of future report count.
exports.dismissReportedComment = wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) return res.status(404).json({ message: "Listing not found" });

  const comment = listing.comments.id(req.params.commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  comment.reportDismissed = true;

  await listing.save();
  res.status(200).json({ message: "Comment report dismissed permanently" });
});

// ============================================================
// STATS
// ============================================================

exports.getStats = wrapAsync(async (req, res) => {
  const [totalUsers, statusCounts, categoryCounts] = await Promise.all([
    User.countDocuments(),
    Listing.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Listing.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
  ]);

  res.status(200).json({
    totalUsers,
    listingsByStatus: Object.fromEntries(statusCounts.map((s) => [s._id, s.count])),
    listingsByCategory: Object.fromEntries(categoryCounts.map((c) => [c._id, c.count])),
  });
});