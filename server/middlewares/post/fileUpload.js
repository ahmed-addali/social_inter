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

function fileUpload(req, res, next) {
  // Use CloudinaryStorage instead of diskStorage
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'socialecho/posts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'webm', 'mov'],
      resource_type: 'auto' // Auto-detect whether it's an image or video
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype.startsWith("image/") ||
        file.mimetype.startsWith("video/")
      ) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
  });

  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Error uploading file",
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    const file = req.files[0];
    // Use the Cloudinary URL directly
    const fileUrl = file.path; // Cloudinary URL is stored in path by multer-storage-cloudinary

    req.file = file;
    req.fileUrl = fileUrl;
    req.fileType = file.mimetype.split("/")[0];

    next();
  });
}

module.exports = fileUpload;
