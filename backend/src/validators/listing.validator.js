// validators/listing.validator.js
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

const updateListingSchema = Joi.object({
    title: Joi.string().trim().min(3).max(100).optional(),
    description: Joi.string().trim().allow("").optional(),
    price: Joi.number().min(0).optional(),
    category: Joi.string().valid(
        "Books", "Electronics", "Cycles", "Hostel Essentials",
        "Stationery", "Clothing", "Sports", "Other"
    ).optional(),
    count: Joi.number().integer().min(1).optional(),
    location: Joi.string().trim().optional()
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid("Listed", "Sold").required()
});

module.exports = { createListingSchema, updateListingSchema, updateStatusSchema };