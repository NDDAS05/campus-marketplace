const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessage: {
      text: { type: String },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: { type: Date },
    },
    // Boolean-only unread flags (no counts needed) — flipped true for the
    // recipient whenever the *other* participant sends a message, and reset
    // false when that participant opens/reads the conversation.
    buyerUnread: {
      type: Boolean,
      default: false,
    },
    sellerUnread: {
      type: Boolean,
      default: false,
    },

    // --- Price negotiation / deal-lock ---
    // null proposedPrice means "still at listing.price" — the frontend
    // falls back to the listing's price when this is null.
    proposedPrice: {
      type: Number,
      default: null,
    },
    proposedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // Any price change resets BOTH of these to false — a stale confirmation
    // must never carry over to a different number. See chat.controller.js.
    buyerConfirmed: {
      type: Boolean,
      default: false,
    },
    sellerConfirmed: {
      type: Boolean,
      default: false,
    },
    // Once true, this conversation's deal fields are permanently frozen —
    // no further price/confirm/unconfirm endpoint calls are accepted.
    dealLocked: {
      type: Boolean,
      default: false,
    },
    finalPrice: {
      type: Number,
      default: null,
    },
    lockedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // updatedAt is what we sort the inbox by (latest first)
);

// One thread per (listing, buyer, seller) — reopening "Message Seller" on the
// same listing resumes the same conversation instead of creating a duplicate.
conversationSchema.index({ listing: 1, buyer: 1, seller: 1 }, { unique: true });

// Fast inbox queries: "does this user (as seller or buyer) have any
// conversations, sorted by latest activity" and "does this user have any
// unread conversation" (navbar badge).
conversationSchema.index({ seller: 1, updatedAt: -1 });
conversationSchema.index({ buyer: 1, updatedAt: -1 });

// Supports listing.controller.js's guard: "has ANY conversation on this
// listing locked a deal" (checked before allowing Sold -> Listed reversal).
conversationSchema.index({ listing: 1, dealLocked: 1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = { Conversation };