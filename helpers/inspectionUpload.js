const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload folder exists
const uploadPath = "uploads/inspection";
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const inspectionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    );
  },
});

/**
 * Allowed file types (images + videos)
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|mp4|avi|mov|mkv/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only images (jpg, png) and videos (mp4, avi, mov, mkv) allowed")
    );
  }
};

/**
 * Multer instance
 */
const uploadInspection = multer({
  storage: inspectionStorage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB per file
  },
});

/**
 * 👉 EXPORT BOTH
 * single  → uploadInspection.single("image")
 * multiple → uploadInspection.array("images", 100)
 */
module.exports = uploadInspection;