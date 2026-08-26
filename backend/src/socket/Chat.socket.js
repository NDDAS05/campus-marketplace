const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { setIO } = require("./emitters.js");

// Small wrapper so a thrown/rejected error inside a socket handler doesn't
// crash the process — sockets have no `next(err)` to fall back on the way
// Express routes do (that's what wrapAsync.js is for over there).
function socketWrapAsync(socket, handler) {
  return async (...args) => {
    try {
      await handler(...args);
    } catch (err) {
      console.error("SOCKET ERROR:", err.message);
      socket.emit("chat_error", { message: err.message || "Something went wrong" });
    }
  };
}

function initChatSockets(io) {
  // Lets chat.controller.js (REST endpoints) emit on this same io instance
  // for events triggered by an HTTP request rather than a socket message —
  // e.g. price_updated, deal_locked, listing_sold.
  setIO(io);

  io.on("connection", (socket) => {
    // Personal room — lets us push updates to a user regardless of which
    // conversation (if any) they currently have open, e.g. so the inbox
    // list and navbar badge update live even from other pages.
    socket.join(`user:${socket.user._id}`);

    // Clients viewing a listing's detail page or chatting about it join
    // this room, so a "listing_sold" broadcast reaches anyone else
    // mid-negotiation on the same item without the server needing to
    // enumerate every conversation tied to that listing.
    socket.on("join_listing", (listingId) => {
      if (listingId) socket.join(`listing:${listingId}`);
    });
    socket.on("leave_listing", (listingId) => {
      if (listingId) socket.leave(`listing:${listingId}`);
    });

    socket.on(
      "send_message",
      socketWrapAsync(socket, async (payload) => {
        const { conversationId, text } = payload || {};

        if (!conversationId || !text || !text.trim()) {
          return socket.emit("chat_error", { message: "conversationId and text are required" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit("chat_error", { message: "Conversation not found" });
        }

        const userId = String(socket.user._id);
        const isBuyer = String(conversation.buyer) === userId;
        const isSeller = String(conversation.seller) === userId;

        if (!isBuyer && !isSeller) {
          return socket.emit("chat_error", { message: "Not a participant in this conversation" });
        }

        const message = await Message.create({
          conversation: conversation._id,
          sender: socket.user._id,
          text: text.trim(),
        });

        conversation.lastMessage = {
          text: message.text,
          sender: socket.user._id,
          createdAt: message.createdAt,
        };

        // Flip the *other* participant's unread flag on; sender's own flag
        // is untouched (they obviously don't have an unread message from
        // themselves).
        if (isBuyer) {
          conversation.sellerUnread = true;
        } else {
          conversation.buyerUnread = true;
        }

        await conversation.save(); // bumps updatedAt too (timestamps: true)

        const messagePayload = {
          _id: message._id,
          conversation: conversation._id,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            username: socket.user.username,
          },
          text: message.text,
          createdAt: message.createdAt,
        };

        const conversationUpdatePayload = {
          _id: conversation._id,
          listing: conversation.listing,
          lastMessage: conversation.lastMessage,
          updatedAt: conversation.updatedAt,
          buyerUnread: conversation.buyerUnread,
          sellerUnread: conversation.sellerUnread,
        };

        const buyerRoom = `user:${conversation.buyer}`;
        const sellerRoom = `user:${conversation.seller}`;

        io.to(buyerRoom).to(sellerRoom).emit("new_message", messagePayload);
        io.to(buyerRoom).to(sellerRoom).emit("conversation_updated", conversationUpdatePayload);
      })
    );

    socket.on(
      "mark_read",
      socketWrapAsync(socket, async (payload) => {
        const { conversationId } = payload || {};
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const userId = String(socket.user._id);
        const isBuyer = String(conversation.buyer) === userId;
        const isSeller = String(conversation.seller) === userId;

        if (!isBuyer && !isSeller) return;

        if (isBuyer && conversation.buyerUnread) {
          conversation.buyerUnread = false;
          await conversation.save();
        } else if (isSeller && conversation.sellerUnread) {
          conversation.sellerUnread = false;
          await conversation.save();
        } else {
          return; // nothing changed, don't emit
        }

        // Only the reader needs to know their badge can clear — no need to
        // notify the other participant.
        socket.emit("conversation_updated", {
          _id: conversation._id,
          buyerUnread: conversation.buyerUnread,
          sellerUnread: conversation.sellerUnread,
        });
      })
    );
  });
}

module.exports = { initChatSockets };