const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    username: Joi.string().trim().min(5).required(),
    email: Joi.string() //checking even before shit hits controller.
    .email()
    .pattern(/@students\.iiests\.ac\.in$/)
    .required()
    .messages({
        "string.pattern.base": "Only IIEST Shibpur student emails are allowed"
    }),
    password: Joi.string().min(6).required(),
    college: Joi.string().optional(),
    // Added support for "year", "dept", "sem", "stream"
    year: Joi.string().valid("1st Year","2nd Year","3rd Year","4th Year","5th Year","Graduated").optional(),
    department: Joi.string().optional(),
    semester: Joi.string().valid("1st Sem","2nd Sem","3rd Sem","4th Sem","5th Sem","6th Sem","7th Sem","8th Sem").optional(),
    stream: Joi.string().valid("B.Tech","B.Arch","M.Tech","PHD").optional(),
});

const loginSchema = Joi.object({
    email:Joi.string().email().required(),
    password:Joi.string().required(),
});

const googleAuthSchema = Joi.object({
    credential: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, googleAuthSchema };