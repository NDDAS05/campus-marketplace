const { Listing } = require("../models/Listing");
const { User } = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const { upload, uploadToCloudinary } = require("../middleware/upload.middleware");
const wrapAsync = require("../utils/wrapAsync");
const mongoose = require("mongoose");
const { moderateListing } = require("../services/moderation.service");

const MAX_NEW_LISTINGS_PER_DAY = 5;
const MAX_RESUBMISSIONS_PER_DAY = 2;

const getPublicId = (imageUrl) => {
  const parts = imageUrl.split("/");
  const uploadIndex = parts.indexOf("upload");
  const publicId = parts.slice(uploadIndex + 2).join("/");
  return publicId.replace(/\.[^/.]+$/, "");
};

//  Create listing
const createListing = wrapAsync(async (req, res) => {
  const { title, description, price, category, count, location } = req.body;

  // Rate limit: max 5 NEW listings per user per rolling 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await Listing.countDocuments({
    seller: req.user._id,
    createdAt: { $gte: twentyFourHoursAgo },
  });
  if (recentCount >= MAX_NEW_LISTINGS_PER_DAY) {
    return res.status(429).json({
      message: `You've reached the daily limit of ${MAX_NEW_LISTINGS_PER_DAY} listings. Please try again tomorrow.`,
    });
  }

  const uploadedImages = await Promise.all(
    req.files.map((file) => uploadToCloudinary(file.buffer, file.mimetype))
  );
  const images = uploadedImages.map((result) => result.secure_url);

  const listing = await Listing.create({
    category,
    seller: req.user._id,
    sellerYear: req.user.year,
    sellerName: req.user.username,
    sellerDepartment: req.user.department,
    title,
    description,
    count: count || 1,
    images,
    location: location || "Shibpur, Howrah",
    price,
    status: "Pending",
  });

  await User.findByIdAndUpdate(req.user._id, {
    $push: { myListings: listing._id },
  });

  res.status(201).json({ message: "Listing submitted for review", listing });

  moderateListing(listing._id).catch((err) => {
    console.error(`Unexpected error in moderateListing for ${listing._id}:`, err);
  });
});

// Get listings route
const getListings = wrapAsync(async (req, res) => {
  const { category, status, search, page = 1, limit = 10, after } = req.query;

  const pipeline = [];

  if (search) {
    pipeline.unshift({
      $search: {
        index: "default",
        compound: {
          should: [
            { text: { query: search, path: "category", score: { boost: { value: 5 } } } },
            { text: { query: search, path: "title", score: { boost: { value: 3 } } } },
            { text: { query: search, path: "sellerDepartment", score: { boost: { value: 2 } } } },
            { text: { query: search, path: "description", score: { boost: { value: 1 } } } },
            { text: { query: search, path: "sellerName", score: { boost: { value: 1 } } } },
          ],
        },
      },
    });
  }

  const matchStage = { status: status || "Listed" };
  if (category) matchStage.category = category;
  if (after) matchStage._id = { $lt: new mongoose.Types.ObjectId(after) };

  pipeline.push({ $match: matchStage });

  if (!search) {
    pipeline.push({ $sort: { _id: -1 } });
  }
  pipeline.push({ $limit: Number(limit) });

  pipeline.push({
    $lookup: {
      from: "users",
      localField: "seller",
      foreignField: "_id",
      as: "seller",
    },
  });
  pipeline.push({ $unwind: "$seller" });

  pipeline.push({
    $project: {
      "seller.password": 0,
      "seller.wishlist": 0,
      "seller.myListings": 0,
      "seller.email": 0,
      "seller.contactInfo": 0,
    },
  });

  const listings = await Listing.aggregate(pipeline);

  let total = 0;
  if (search) {
    const totalPipeline = [...pipeline];
    totalPipeline.splice(-4);
    totalPipeline.push({ $count: "total" });
    const totalResult = await Listing.aggregate(totalPipeline);
    total = totalResult.length > 0 ? totalResult[0].total : 0;
  } else {
    total = await Listing.countDocuments(matchStage);
  }

  res.status(200).json({
    listings,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      hasMore: listings.length === Number(limit),
      nextCursor: listings.length > 0 ? listings[listings.length - 1]._id : null,
    },
  });
});

const getSuggestedListings = wrapAsync(async (req, res) => {
  const { year, department, _id } = req.user;

  const suggested = await Listing.find({
    status: "Listed",
    seller: { $ne: _id },
    $or: [{ sellerYear: year }, { sellerDepartment: department }],
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("seller", "name username year department");

  res.status(200).json({ listings: suggested });
});

const getListingById = wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("seller", "name username email contactInfo isContactDisplayable year department")
    .populate("comments.user", "name username");

  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  // Only the owner can view a listing that isn't publicly Listed yet.
  if (listing.status !== "Listed") {
    const isOwner = req.user && listing.seller._id.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(404).json({ message: "Listing not found" });
    }
  }

  res.status(200).json({ listing });
});

// Update — Listed or Rejected only, re-checks AI, capped at 2 resubmissions/day
const updateListing = wrapAsync(async (req, res) => {
  const { title, description, price, category, count, location } = req.body;

  const listing = await Listing.findOne({ _id: req.params.id, seller: req.user._id });

  if (!listing) {
    return res.status(404).json({
      message: "Listing not found or you are not the owner",
    });
  }

  if (!["Listed", "Rejected"].includes(listing.status)) {
    return res.status(400).json({
      message: `Listings with status "${listing.status}" can't be edited right now.`,
    });
  }

  // Reset the resubmission counter once a day, so a seller isn't
  // permanently capped after one bad day.
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  if (listing.updatedAt < twentyFourHoursAgo) {
    listing.resubmissionCount = 0;
  }

  if (listing.resubmissionCount >= MAX_RESUBMISSIONS_PER_DAY) {
    return res.status(429).json({
      message: `You've reached the daily edit limit (${MAX_RESUBMISSIONS_PER_DAY}) for this listing. Please try again tomorrow.`,
    });
  }

  if (title !== undefined) listing.title = title;
  if (description !== undefined) listing.description = description;
  if (price !== undefined) listing.price = price;
  if (category !== undefined) listing.category = category;
  if (count !== undefined) listing.count = count;
  if (location !== undefined) listing.location = location;

  listing.status = "Pending";
  listing.moderationReason = null;
  listing.aiCheckFailed = false;
  listing.resubmissionCount += 1;

  await listing.save();

  res.status(200).json({ message: "Listing updated and resubmitted for review", listing });

  moderateListing(listing._id).catch((err) => {
    console.error(`Unexpected error in moderateListing for ${listing._id}:`, err);
  });
});

// Delete
const deleteListing = wrapAsync(async (req, res) => {
  const listing = await Listing.findOne({
    _id: req.params.id,
    seller: req.user._id,
  });

  if (!listing) {
    return res.status(404).json({
      message: "Listing not found or you are not the owner",
    });
  }

  await Promise.all(
    listing.images.map((url) => cloudinary.uploader.destroy(getPublicId(url)))
  );

  await listing.deleteOne();

  await User.findByIdAndUpdate(req.user._id, { $pull: { myListings: listing._id } });

  res.status(200).json({ message: "Listing deleted successfully" });
});

// Update Listing Status (Listed <-> Sold, unrelated to moderation)
const updateListingStatus = wrapAsync(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["Listed", "Sold"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be Listed or Sold",
    });
  }

  const listing = await Listing.findOneAndUpdate(
    { _id: req.params.id, seller: req.user._id },
    { status },
    { new: true }
  );

  if (!listing) {
    return res.status(404).json({
      message: "Listing not found or you are not the owner",
    });
  }

  res.status(200).json({ message: `Listing marked as ${status}`, listing });
});

module.exports = {
  createListing,
  getListings,
  getSuggestedListings,
  updateListing,
  deleteListing,
  getListingById,
  updateListingStatus,
};