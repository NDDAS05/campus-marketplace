const express = require("express");
const router = express.Router();
const { isAdmin } = require("../middleware/admin.middleware");
const {
  adminGoogleLogin,
  getAdminMe,
  adminLogout,
  getPendingListings,
  getListingHistory,
  approveListing,
  rejectListing,
  getReportedComments,
  adminDeleteComment,
  dismissReportedComment,
  getStats,
} = require("../controllers/admin.controller");
const { googleAuthSchema } = require("../validators/auth.validator");
const validate  = require("../middleware/validate.middleware.js")

// Auth
router.post("/auth/google",validate(googleAuthSchema), adminGoogleLogin);
router.post("/auth/logout", adminLogout);
router.get("/auth/me", isAdmin, getAdminMe);

// Listings
router.get("/listings/pending", isAdmin, getPendingListings);
router.get("/listings/history", isAdmin, getListingHistory);
router.patch("/listings/:id/approve", isAdmin, approveListing);
router.patch("/listings/:id/reject", isAdmin, rejectListing);

// Comments
router.get("/comments/reported", isAdmin, getReportedComments);
router.patch("/listings/:id/comments/:commentId/delete", isAdmin, adminDeleteComment);
router.patch("/listings/:id/comments/:commentId/dismiss", isAdmin, dismissReportedComment);

// Stats
router.get("/stats", isAdmin, getStats);

module.exports = router;