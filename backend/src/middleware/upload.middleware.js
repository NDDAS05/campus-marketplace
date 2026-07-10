const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

// Store file in memory temporarily instead of disk
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per image
        files: 10,
    },
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only jpg, png, and webp images are allowed"), false);
        }
    },
});

// Helper to upload a single buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "campus-marketplace/listings",
                transformation: [{ width: 1000, height: 1000, crop: "limit" }],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(buffer);
    });
};

module.exports = { upload, uploadToCloudinary };