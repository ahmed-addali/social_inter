const fs = require("fs");
const multer = require("multer");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

function avatarUpload(req, res, next) {
  // Use CloudinaryStorage instead of diskStorage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'socialecho/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 20 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/png"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  upload.any()(req, res, (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: err.message,
      });
    } else {
      // Adjust the file URL to use Cloudinary URL instead of local path
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          file.cloudinaryUrl = file.path; // Cloudinary URL is stored in path by multer-storage-cloudinary
        });
      }
      next();
    }
  });
}

module.exports = avatarUpload;
