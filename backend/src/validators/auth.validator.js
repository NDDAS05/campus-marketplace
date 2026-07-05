const Joi = require("joi");

const registerSchema = Joi.object({
    name:Joi.string().trim().min(1).required(),
    username:Joi.string().trim().min(5).required(),
    email:Joi.string().email().required(),
    password:Joi.string().min(6).required(),
    college:Joi.string().optional(),
});

const loginSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),
});

module.exports = {registerSchema,loginSchema};
