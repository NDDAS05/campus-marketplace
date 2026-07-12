const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth.middleware');
const { upload } = require("../middleware/upload.middleware");
const validate = require('../middleware/validate.middleware'); // <-- FIX: Imported validate middleware

const { createListingSchema, updateListingSchema, updateStatusSchema } = require("../validators/listing.validator");
const { addCommentSchema } = require("../validators/comment.validator"); // <-- ADDED: Imported comment schema

const { createListing, getListings, getSuggestedListings, updateListing, deleteListing, getListingById, updateListingStatus } = require('../controllers/listing.controller');
const { addComment, deleteComment } = require('../controllers/comment.controller');

router.get("/suggested", isLoggedIn, getSuggestedListings);
router.get("/", getListings);
router.get("/:id", getListingById);

// Multer must process the multipart/form-data first so req.body exists for joi Validation
router.post('/', isLoggedIn, upload.array('images', 10), validate(createListingSchema), createListing);
router.put("/:id", isLoggedIn, validate(updateListingSchema), updateListing); // <-- ADDED: Validation for edits
router.delete("/:id", isLoggedIn, deleteListing);
router.patch("/:id/status", isLoggedIn, validate(updateStatusSchema), updateListingStatus); // <-- ADDED: Validation for status

// Comment Routes
router.post("/:id/comments", isLoggedIn, validate(addCommentSchema), addComment); // <-- ADDED: Comment validation here!
router.delete("/:id/comments/:commentId", isLoggedIn, deleteComment);

module.exports = router;