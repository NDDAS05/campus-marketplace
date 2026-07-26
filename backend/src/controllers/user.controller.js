const { User } = require("../models/User");
const wrapAsync = require("../utils/wrapAsync");

// GET /api/users/profile
exports.getProfile = wrapAsync(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("-password")
    .populate("myListings")
    .populate("wishlist");

  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user.toObject());
});

// PUT /api/users/profile
exports.updateProfile = wrapAsync(async (req, res) => {
  const { contactInfo, ...otherUpdates } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  let message = "Profile updated successfully";
  let skippedFields = [];

  if (contactInfo !== undefined) {
    if (user.contactInfo && user.contactInfo.trim() !== "") {
      skippedFields.push("contactInfo");
      message = "Profile updated, but contactInfo could not be changed as it is already locked.";
    } else {
      otherUpdates.contactInfo = contactInfo;
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $set: otherUpdates },
    { new: true, runValidators: true }
  ).select("-password");

  res.status(200).json({
    message,
    skippedFields,
    user: updatedUser,
  });
});

// GET /api/users/:id (Public Seller/Commenter Profile)
exports.getUserById = wrapAsync(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password -wishlist")
    .populate({
      path: "myListings",
      match: { status: "Listed" },
    });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const publicProfile = user.toObject();

  if (!publicProfile.isContactDisplayable || !publicProfile.contactInfo) {
    publicProfile.contactInfo = "Hidden";
  }

  res.status(200).json(publicProfile);
});

// POST /api/users/wishlist/:listingId
exports.addToWishlist = wrapAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { wishlist: req.params.listingId } });
  res.status(200).json({ message: "Added to wishlist" });
});

// DELETE /api/users/wishlist/:listingId
exports.removeFromWishlist = wrapAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $pull: { wishlist: req.params.listingId } });
  res.status(200).json({ message: "Removed from wishlist" });
});