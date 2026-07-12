const { User } = require("../models/User");
const wrapAsync = require("../utils/wrapAsync");

//   GET /api/users/profile
exports.getProfile = wrapAsync(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("-password")
        .populate("myListings");

    if (!user) return res.status(404).json({ message: "User not found" });

    const profileResponse = user.toObject();

    res.status(200).json(profileResponse);
});

//   PUT /api/users/profile
exports.updateProfile = wrapAsync(async (req, res) => {
    const { contactInfo, ...otherUpdates } = req.body;
    const user = await User.findById(req.user._id);
    //  Defensive check!
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    let message = "Profile updated successfully";
    let skippedFields = [];

    //  "Set Once" rule
    if (contactInfo !== undefined) {
        if (user.contactInfo && user.contactInfo.trim() !== "") {
            // If already set, do not update, add to skipped fields
            skippedFields.push("contactInfo");
            message = "Profile updated, but contactInfo could not be changed as it is already locked.";
        } else {
            // If empty, allow the update
            otherUpdates.contactInfo = contactInfo;
        }
    }

    // Perform the update with remaining allowed fields
    // Allows name, stream, dept, year, semester, and isContactDisplayable to change freely
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: otherUpdates },
        { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({ 
        message, 
        skippedFields,
        user: updatedUser 
    });
});


// GET /api/users/:id (Public Seller/Commenter Profile)
exports.getUserById = wrapAsync(async (req, res) => {
    // Fetch user by the ID in the URL
    const user = await User.findById(req.params.id)
        .select("-password -wishlist")
        .populate({
            path: "myListings",
            match: { status: "Listed" } // Only show their ACTIVE listings to the public
        });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const publicProfile = user.toObject();

    // Privacy Lock: Enforce the seller's contact preferences
    if (!publicProfile.isContactDisplayable || !publicProfile.contactInfo) {
        publicProfile.contactInfo = "Hidden";
    }

    res.status(200).json(publicProfile);
});