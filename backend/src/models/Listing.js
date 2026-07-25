const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    dislikedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Once an admin dismisses a report, this comment is permanently
    // excluded from the report queue — new reports keep incrementing
    // dislikedBy, but it never requeues regardless of count.
    reportDismissed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const listingSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: [
        "Books",
        "Electronics",
        "Cycles",
        "Hostel Essentials",
        "Stationery",
        "Clothing",
        "Sports",
        "Other",
      ],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    sellerYear: {
      type: String,
    },
    sellerDepartment: {
      type: String,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    count: {
      type: Number,
      default: 1,
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      default: "Shibpur, Howrah",
    },
    status: {
      type: String,
      enum: ["Pending", "Listed", "Under Review", "Rejected", "Sold"],
      default: "Pending",
    },
    moderationReason: {
      type: String,
      default: null,
    },
    aiCheckFailed: {
      type: Boolean,
      default: false,
    },
    // Tracks edit/resubmission attempts on THIS listing, capped at 2/day.
    // Separate from the account-wide 5-new-listings/day limit on createListing.
    resubmissionCount: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  },
);

const Comments = mongoose.model("Comments", commentSchema);
const Listing = mongoose.model("Listing", listingSchema);
module.exports = { Listing, Comments };