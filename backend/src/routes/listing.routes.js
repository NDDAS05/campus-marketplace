const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { createListing, getListings, getSuggestedListings, updateListing, deleteListing, getListingById, updateListingStatus } = require('../controllers/listing.controller');

// No authentication needed for getting stuff so...
router.get("/", getListings);
router.get("/:id", getListingById);

// These come AFTER authentication
router.get("/suggested", isLoggedIn, getSuggestedListings);
router.post('/create', isLoggedIn, upload.array('images', 10), createListing);
router.put("/:id", isLoggedIn, updateListing);
router.delete("/:id", isLoggedIn, deleteListing);
router.patch("/:id/status", isLoggedIn, updateListingStatus);

module.exports = router;