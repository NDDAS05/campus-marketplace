const { Conversation } = require("../models/Conversation.js");
const { Message } = require("../models/Message.js");
const { setIO } = require("./emitters.js");

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
  setIO(io);

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user._id}`);

    socket.on("join_listing", (listingId) => {
      if (listingId) socket.join(`listing:${listingId}`);
    });
    socket.on("leave_listing", (listingId) => {
      if (listingId) socket.leave(`listing:${listingId}`);
    });

    socket.on(
      "send_message",
      socketWrapAsync(socket, async (payload) => {
        // FIX: clientId is an id the browser generates per outgoing
        // message (see Messagepage.jsx). We just echo it back unchanged
        // so the sender can match this exact send to its own optimistic
        // bubble by id, instead of by text -- matching by text broke when
        // the same short message ("ok", "yes") was sent twice in a row.
        const { conversationId, text, clientId } = payload || {};

        if (!conversationId || !text || !text.trim()) {
          return socket.emit("chat_error", { message: "conversationId and text are required" });
        }

        // Load once just to check participancy/get buyer+seller ids -- the
        // actual mutation below does NOT reuse this document instance.
        const conversation = await Conversation.findById(conversationId).select("buyer seller");
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

        // FIX (race condition): the old code did
        //   conversation.lastMessage = ...; conversation.save()
        // on a document loaded at the top of this handler. When the buyer
        // and seller send messages within milliseconds of each other, both
        // handlers load the SAME stale snapshot, then each .save() writes
        // back its ENTIRE in-memory copy -- so whichever save lands second
        // silently reverts the unread flag / lastMessage the first save
        // just set (a classic lost-update race). Using findByIdAndUpdate
        // with $set instead only ever touches the two fields this send
        // actually intends to change, atomically, at the DB level -- so
        // two concurrent sends (or a send racing a mark_read) can never
        // clobber each other's flags, no matter the timing.
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversation._id,
          {
            $set: {
              lastMessage: {
                text: message.text,
                sender: socket.user._id,
                createdAt: message.createdAt,
              },
              ...(isBuyer ? { sellerUnread: true } : { buyerUnread: true }),
            },
          },
          { new: true }
        ).populate("listing", "title images price status");

        const messagePayload = {
          _id: message._id,
          conversation: updatedConversation._id,
          clientId: clientId || null,
          sender: {
            _id: socket.user._id,
            name: socket.user.name,
            username: socket.user.username,
          },
          text: message.text,
          createdAt: message.createdAt,
        };

        const conversationUpdatePayload = {
          _id: updatedConversation._id,
          listing: updatedConversation.listing, // Fully populated object
          lastMessage: updatedConversation.lastMessage,
          updatedAt: updatedConversation.updatedAt,
          buyerUnread: updatedConversation.buyerUnread,
          sellerUnread: updatedConversation.sellerUnread,
        };

        const buyerRoom = `user:${updatedConversation.buyer}`;
        const sellerRoom = `user:${updatedConversation.seller}`;

        io.to(buyerRoom).to(sellerRoom).emit("new_message", messagePayload);
        io.to(buyerRoom).to(sellerRoom).emit("conversation_updated", conversationUpdatePayload);
      })
    );

    socket.on(
      "mark_read",
      socketWrapAsync(socket, async (payload) => {
        const { conversationId } = payload || {};
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId).select("buyer seller");
        if (!conversation) return;

        const userId = String(socket.user._id);
        const isBuyer = String(conversation.buyer) === userId;
        const isSeller = String(conversation.seller) === userId;

        if (!isBuyer && !isSeller) return;

        // FIX: same lost-update race as send_message above -- this used to
        // load-mutate-save a full document, which could race with (and
        // silently undo) a concurrent send_message setting this same flag
        // true. Atomic $set fixes it here too. Also switched from an
        // early-return-if-already-false check to $set unconditionally --
        // that early return was itself reading potentially-stale state;
        // setting false when it's already false is a harmless no-op.
        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversation._id,
          { $set: isBuyer ? { buyerUnread: false } : { sellerUnread: false } },
          { new: true }
        ).populate("listing", "title images price status");

        socket.emit("conversation_updated", {
          _id: updatedConversation._id,
          listing: updatedConversation.listing,
          buyerUnread: updatedConversation.buyerUnread,
          sellerUnread: updatedConversation.sellerUnread,
        });
      })
    );
  });
}

module.exports = { initChatSockets };