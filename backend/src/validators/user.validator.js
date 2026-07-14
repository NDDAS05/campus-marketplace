const Joi = require("joi");

const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(1).optional(),
    stream: Joi.string().valid("B.Tech", "B.Arch", "M.Tech", "PHD").optional(),
    department: Joi.string().trim().optional(),
    year: Joi.string().valid("1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Graduated").optional(),
    semester: Joi.string().valid("1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem").optional(),
    contactInfo: Joi.string().trim().optional(),
    isContactDisplayable: Joi.boolean().optional()
}).unknown(false); // Prevents users from sending fields we didn't define

module.exports = { updateProfileSchema };