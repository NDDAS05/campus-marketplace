const Joi = require("joi");

const createListingSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().allow("").optional(),
    price: Joi.number().min(0).required(), 
    category: Joi.string().valid(
        "Books", "Electronics", "Cycles", "Hostel Essentials", 
        "Stationery", "Clothing", "Sports", "Other"
    ).required(),
    count: Joi.number().integer().min(1).optional(),
    location: Joi.string().trim().optional()
});

module.exports = { createListingSchema }; 