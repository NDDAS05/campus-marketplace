const Joi = require("joi");

const addCommentSchema = Joi.object({
    text: Joi.string().trim().min(1).max(500).required().messages({
        "string.empty": "Comment text cannot be empty",
        "string.min": "Comment text cannot be empty",
        "string.max": "Comment cannot exceed 500 characters",
        "any.required": "Comment text is required"
    })
});

module.exports = { addCommentSchema };