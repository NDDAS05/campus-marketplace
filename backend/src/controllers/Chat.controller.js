const mongoose = require("mongoose");
const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { Listing } = require("../models/Listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { emitToUsers, emitToListing } = require("../socket/emitters.js");

// Negotiation floor: a proposed price can't go below this fraction of the
// listing's original price. Ceiling is always the listing's original price.
const MIN_PRICE_RATIO = 0.5;

// Single source of truth for which listing fields ride along on every
// conversation the client receives (REST or socket). NegotiationBanner
// needs price + status to decide whether negotiation is even allowed;
// the inbox row needs title + images; count is included for parity with
// what listing.controller.js exposes elsewhere. Any endpoint that sends
// a conversation back to the client MUST populate with this same field
// set — a partially- or un-populated listing gets merged into frontend
// state and silently clobbers whatever was there before (see chat bug
// writeup: getInbox / createOrGetConversation / lockDeal were missing
// this, which broke the negotiation banner and inbox item info).
const LISTING_POPULATE_FIELDS = "title images price status count";

// POST /api/chats  { listingId, sellerId }
// Get-or-create the conversation for this (listing, buyer=req.user, seller)
// triple. Called when a buyer clicks "Message Seller" on the listing detail
// page — reopening the same listing's chat resumes the same thread.
const createOrGetConversation = wrapAsync(async (req, res) => {
  const { listingId, sellerId } = req.body;
  const buyerId = req.user._id;

  if (String(sellerId) === String(buyerId)) {
    return res.status(400).json({ message: "You cannot message yourself" });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ message: "Listing not found" });
  }

  let conversation = await Conversation.findOne({
    listing: listingId,
    buyer: buyerId,
    seller: sellerId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      listing: listingId,
      buyer: buyerId,
      seller: sellerId,
    });
  }

  // FIX: this was the very first response the client sees when a buyer
  // opens a fresh chat ("Chat with Seller") — previously returned raw,
  // unpopulated ObjectIds for listing/buyer/seller, so the header, item
  // thumbnail, and negotiation banner all rendered broken on first open.
  // .create() doesn't run populate, so re-fetch+populate regardless of
  // which branch above ran.
  conversation = await Conversation.findById(conversation._id)
    .populate("buyer", "name username")
    .populate("seller", "name username")
    .populate("listing", LISTING_POPULATE_FIELDS);

  res.status(200).json({ conversation });
});

// GET /api/chats
// Inbox for the logged-in user, whichever side of the conversation they're
// on (buyer or seller) — sorted latest-first via updatedAt.
const getInbox = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    $or: [{ buyer: userId }, { seller: userId }],
  })
    .sort({ updatedAt: -1 })
    .populate("buyer", "name username")
    .populate("seller", "name username")
    // FIX: was "title images" only — NegotiationBanner reads
    // conversation.listing?.price and gates negotiation on
    // conversation.listing?.status === "Listed", so without these two
    // fields the banner never showed for an unlocked, active chat.
    .populate("listing", LISTING_POPULATE_FIELDS);

  res.status(200).json({ conversations });
});

// GET /api/chats/:conversationId/messages?cursor=<messageId>&limit=20
// Cursor-based pagination, newest page first, matching the style used
// elsewhere in the app. NOTE: I haven't seen your listing pagination
// implementation, so double-check this lines up with that convention.
const getMessages = wrapAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { cursor, limit = 20 } = req.query;
  const userId = String(req.user._id);

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  if (![String(conversation.buyer), String(conversation.seller)].includes(userId)) {
    return res.status(403).json({ message: "Not a participant in this conversation" });
  }

  const query = { conversation: conversationId };
  if (cursor) {
    // FIX: Paginate strictly using _id instead of createdAt.
    // MongoDB ObjectIds are monotonically increasing and unique, preventing
    // messages with duplicate millisecond timestamps from being skipped.
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const messages = await Message.find(query)
    .sort({ _id: -1 })
    .limit(Number(limit))
    .populate("sender", "name username");

  const nextCursor = messages.length === Number(limit) ? messages[messages.length - 1]._id : null;

  res.status(200).json({
    messages: messages.reverse(), // chronological order for rendering
    nextCursor,
  });
});

// PATCH /api/chats/:conversationId/read
// Clears the caller's unread flag (called when they open a conversation).
const markRead = wrapAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = String(req.user._id);

  let conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const isBuyer = String(conversation.buyer) === userId;
  const isSeller = String(conversation.seller) === userId;

  if (!isBuyer && !isSeller) {
    return res.status(403).json({ message: "Not a participant in this conversation" });
  }

  if (isBuyer) conversation.buyerUnread = false;
  if (isSeller) conversation.sellerUnread = false;

  await conversation.save();

  // FIX: same class of bug as getInbox/createOrGetConversation — an
  // unpopulated listing here gets merged into frontend state on every
  // "open conversation" call and can wipe out title/images/price/status
  // that a previous, correctly-populated response had set.
  conversation = await conversation.populate("listing", LISTING_POPULATE_FIELDS);

  res.status(200).json({ conversation });
});

// GET /api/chats/unread-status
// { hasUnread: boolean } — for the navbar Messages badge on initial load.
// Kept in sync live afterward via the "conversation_updated" socket event.
const getUnreadStatus = wrapAsync(async (req, res) => {
  const userId = req.user._id;

  const hasUnread = await Conversation.exists({
    $or: [
      { seller: userId, sellerUnread: true },
      { buyer: userId, buyerUnread: true },
    ],
  });

  res.status(200).json({ hasUnread: Boolean(hasUnread) });
});

// PATCH /api/chats/:conversationId/price  { price }
// Propose/change the negotiated price. Resets BOTH confirm flags
// unconditionally — a stale confirmation must never carry over to a
// different number.
const proposePrice = wrapAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { price } = req.body;
  const userId = String(req.user._id);

  const conversation = await Conversation.findById(conversationId).populate("listing");
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const isBuyer = String(conversation.buyer) === userId;
  const isSeller = String(conversation.seller) === userId;
  if (!isBuyer && !isSeller) {
    return res.status(403).json({ message: "Not a participant in this conversation" });
  }

  if (conversation.dealLocked) {
    return res.status(400).json({ message: "This deal is already locked and can't be changed" });
  }

  const listing = conversation.listing;
  if (listing.status !== "Listed") {
    return res.status(400).json({ message: "This listing is no longer available to negotiate on" });
  }

  const numericPrice = Number(price);
  const floor = listing.price * MIN_PRICE_RATIO;
  if (!Number.isFinite(numericPrice) || numericPrice < floor || numericPrice > listing.price) {
    return res.status(400).json({
      message: `Price must be between ${floor} and ${listing.price}`,
    });
  }

  conversation.proposedPrice = numericPrice;
  conversation.proposedBy = req.user._id;
  conversation.buyerConfirmed = false;
  conversation.sellerConfirmed = false;

  await conversation.save();

  emitToUsers([conversation.buyer, conversation.seller], "price_updated", {
    conversationId: conversation._id,
    proposedPrice: conversation.proposedPrice,
    proposedBy: conversation.proposedBy,
    buyerConfirmed: conversation.buyerConfirmed,
    sellerConfirmed: conversation.sellerConfirmed,
  });

  res.status(200).json({ conversation });
});

// Runs the atomic lock step once both sides have confirmed: decrements
// listing.count, flips listing.status to "Sold" only once count hits 0, and
// freezes the conversation's deal fields — all inside a transaction so a
// crash mid-way can't leave the two collections disagreeing with each
// other. Returns the updated conversation, or null if another conversation
// won the race for the last unit (caller should report "sold out").
async function lockDeal(conversationId) {
  const session = await mongoose.startSession();
  let result = null; // { conversation, listing } | null

  await session.withTransaction(async () => {
    const conversation = await Conversation.findById(conversationId).session(session);
    if (!conversation || conversation.dealLocked) return; // already locked / gone

    const listing = await Listing.findById(conversation.listing).session(session);
    if (!listing || listing.status !== "Listed" || listing.count <= 0) {
      // Someone else took the last unit, or it's no longer listed — abort,
      // leave both confirm flags as-is so the parties can see what happened.
      return;
    }

    listing.count -= 1;
    if (listing.count === 0) {
      listing.status = "Sold";
    }
    await listing.save({ session });

    conversation.dealLocked = true;
    conversation.finalPrice = conversation.proposedPrice ?? listing.price;
    conversation.lockedAt = new Date();
    await conversation.save({ session });

    // FIX: this conversation is what confirmPrice sends straight back to
    // the client in the HTTP response — right at the moment a deal locks,
    // when accurate item info matters most. It was being returned with a
    // raw listing ObjectId (no populate), which would clobber the
    // populated listing the frontend already had. Populate inside the
    // transaction/session so the read is consistent with what was just
    // written.
    await conversation.populate({ path: "listing", select: LISTING_POPULATE_FIELDS, options: { session } });

    result = { conversation, listing };
  });

  session.endSession();
  return result;
}

// PATCH /api/chats/:conversationId/confirm-price
// Sets the caller's own confirm flag true. If both flags are now true,
// triggers the lock transaction.
const confirmPrice = wrapAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = String(req.user._id);

  const conversation = await Conversation.findById(conversationId).populate("listing");
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const isBuyer = String(conversation.buyer) === userId;
  const isSeller = String(conversation.seller) === userId;
  if (!isBuyer && !isSeller) {
    return res.status(403).json({ message: "Not a participant in this conversation" });
  }

  if (conversation.dealLocked) {
    return res.status(400).json({ message: "This deal is already locked" });
  }
  if (conversation.listing.status !== "Listed") {
    return res.status(400).json({ message: "This listing is no longer available" });
  }

  if (isBuyer) conversation.buyerConfirmed = true;
  if (isSeller) conversation.sellerConfirmed = true;
  await conversation.save();

  if (conversation.buyerConfirmed && conversation.sellerConfirmed) {
    const locked = await lockDeal(conversation._id);
    if (!locked) {
      return res.status(409).json({
        message: "This item just sold out before your deal could be locked",
      });
    }

    emitToUsers([conversation.buyer, conversation.seller], "deal_locked", {
      conversationId: locked.conversation._id,
      finalPrice: locked.conversation.finalPrice,
      lockedAt: locked.conversation.lockedAt,
    });

    // Only broadcast "sold" to everyone else watching this listing once it
    // actually runs out (count hit 0) — a multi-unit listing with stock
    // left is still negotiable by other buyers.
    if (locked.listing.status === "Sold") {
      emitToListing(locked.listing._id, "listing_sold", {
        listingId: locked.listing._id,
        status: locked.listing.status,
      });
    }

    return res.status(200).json({ conversation: locked.conversation, dealLocked: true });
  }

  emitToUsers([conversation.buyer, conversation.seller], "price_updated", {
    conversationId: conversation._id,
    buyerConfirmed: conversation.buyerConfirmed,
    sellerConfirmed: conversation.sellerConfirmed,
  });

  res.status(200).json({ conversation, dealLocked: false });
});

// PATCH /api/chats/:conversationId/unconfirm-price
// Undo the caller's own confirmation. No-op on proposedPrice/proposedBy.
// Rejected once the deal is locked — locking is final.
const unconfirmPrice = wrapAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = String(req.user._id);

  let conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const isBuyer = String(conversation.buyer) === userId;
  const isSeller = String(conversation.seller) === userId;
  if (!isBuyer && !isSeller) {
    return res.status(403).json({ message: "Not a participant in this conversation" });
  }

  if (conversation.dealLocked) {
    return res.status(400).json({ message: "This deal is already locked and can't be undone" });
  }

  if (isBuyer) conversation.buyerConfirmed = false;
  if (isSeller) conversation.sellerConfirmed = false;
  await conversation.save();

  emitToUsers([conversation.buyer, conversation.seller], "price_updated", {
    conversationId: conversation._id,
    buyerConfirmed: conversation.buyerConfirmed,
    sellerConfirmed: conversation.sellerConfirmed,
  });

  // FIX: same pattern as markRead — populate before returning so this
  // doesn't clobber good listing data already in frontend state.
  conversation = await conversation.populate("listing", LISTING_POPULATE_FIELDS);

  res.status(200).json({ conversation });
});

module.exports = {
  createOrGetConversation,
  getInbox,
  getMessages,
  markRead,
  getUnreadStatus,
  proposePrice,
  confirmPrice,
  unconfirmPrice,
};