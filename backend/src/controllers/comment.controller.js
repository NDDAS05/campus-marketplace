const {Listing} = require("../models/Listing");
const wrapAsync = require("../utils/wrapAsync");
//   POST /api/listings/:id/comments
const addComment = wrapAsync(async (req, res) => {
        const { text } = req.body;
        const listingId = req.params.id;

        // Joi Validation is already existing to ensure Proper Validation

        const listing = await Listing.findById(listingId);
        
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Push the new comment into the listing's comments array
        listing.comments.push({
            user: req.user._id,
            text: text.trim()
        });

        await listing.save();

        // Populate the user details so the frontend has the commenter's name/username immediately
        await listing.populate("comments.user", "name username");

        res.status(201).json({ message: "Comment added successfully", listing });
});

//  DELETE /api/listings/:id/comments/:commentId
const deleteComment = wrapAsync(async (req, res) => {
        const { id, commentId } = req.params;

        const listing = await Listing.findById(id);
        if (!listing) {
            return res.status(404).json({ message: "Listing not found" });
        }

        // Mongoose subdocument method (.id) makes finding the exact comment super easy
        const comment = listing.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Authorization Check: Ensure the logged-in user actually owns this comment
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        // Soft Delete Logic
        comment.text = "This Message has been Deleted";
        comment.isDeleted = true;

        await listing.save();

        res.status(200).json({ message: "Comment deleted successfully", listing });
});

// PATCH /api/listings/:id/comments/:commentId/dislike
const toggleCommentDislike = wrapAsync(async (req, res) => {
  const { id, commentId } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  const comment = listing.comments.id(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  // Can't dislike your own comment
  if (comment.user.toString() === req.user._id.toString()) {
    return res.status(403).json({ message: "You can't dislike your own comment" });
  }

  const userId = req.user._id.toString();
  const alreadyDisliked = comment.dislikedBy.some((id) => id.toString() === userId);

  if (alreadyDisliked) {
    comment.dislikedBy = comment.dislikedBy.filter((id) => id.toString() !== userId);
  } else {
    comment.dislikedBy.push(req.user._id);
  }

  await listing.save();
  await listing.populate("comments.user", "name username");

  res.status(200).json({ message: "Dislike toggled", listing });
});

module.exports = { addComment, deleteComment, toggleCommentDislike };