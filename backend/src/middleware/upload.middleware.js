// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../utils/cloudinary");

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params: {
//         folder: "campus-marketplace/listings",
//         allowed_formats: ["jpg", "jpeg", "png", "webp"],
//         transformation: [{ width: 1000, height: 1000, crop: "limit" }],
//     },
// });

// const upload = multer({
//     storage: storage,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB per image
//         files: 10,                  // max 10 images per listing
//     },
//     fileFilter: (req, file, cb) => {
//         const allowed = ["image/jpeg", "image/png", "image/webp"];
//         if (allowed.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error("Only jpg, png, and webp images are allowed"), false);
//         }
//     },
// });

// module.exports = upload;