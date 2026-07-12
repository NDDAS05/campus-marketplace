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
  },
  {
    timestamps: true,
  },
);

const listingSchema = new mongoose.Schema(
  {
    category: {
      // added more categories to the enum for better classification of items
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
      enum: ["Listed", "Sold"],
      default: "Listed",
    },
    price: {
      // Added item price field
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