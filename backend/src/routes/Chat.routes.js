const express = require("express");
const router = express.Router();

const { isLoggedIn } = require("../middleware/auth.middleware.js");
const validate = require("../middleware/validate.middleware.js");
const { createConversationSchema, proposePriceSchema } = require("../validators/Chat.validator.js");
const {
  createOrGetConversation,
  getInbox,
  getMessages,
  markRead,
  getUnreadStatus,
  proposePrice,
  confirmPrice,
  unconfirmPrice,
} = require("../controllers/Chat.controller.js");

router.use(isLoggedIn); // every chat route requires auth

router.get("/unread-status", getUnreadStatus);
router.get("/", getInbox);
router.post("/", validate(createConversationSchema), createOrGetConversation);
router.get("/:conversationId/messages", getMessages);
router.patch("/:conversationId/read", markRead);
router.patch("/:conversationId/price", validate(proposePriceSchema), proposePrice);
router.patch("/:conversationId/confirm-price", confirmPrice);
router.patch("/:conversationId/unconfirm-price", unconfirmPrice);

module.exports = router;