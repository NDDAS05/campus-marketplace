const Joi = require("joi");

// This assumes the common convention of exporting Joi schemas that
// a shared `validate(schema)` middleware calls `.validate(req.body)` on.

const createConversationSchema = Joi.object({
  listingId: Joi.string().hex().length(24).required(),
  sellerId: Joi.string().hex().length(24).required(),
});

// Only checks shape/type here — the actual floor/ceiling bounds depend on
// the listing's price, which isn't known until the controller loads the
// conversation, so that range check happens in chat.controller.js.
const proposePriceSchema = Joi.object({
  price: Joi.number().positive().required(),
});

module.exports = { createConversationSchema, proposePriceSchema };