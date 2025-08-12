const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../uploads');
const newsUploadsDir = path.join(uploadDir, 'news');
const filesUploadsDir = path.join(uploadDir, 'files');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, newsUploadsDir, filesUploadsDir, tempDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration for news images
const newsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, newsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Storage configuration for encrypted files
const filesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, filesUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports images (jpeg, jpg, png, gif, webp)!'));
};

// Create upload middleware
const uploadNewsImage = multer({
  storage: newsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: imageFilter
});

const uploadFile = multer({
  storage: filesStorage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

module.exports = {
  uploadNewsImage,
  uploadFile,
  uploadDirs: {
    news: newsUploadsDir,
    files: filesUploadsDir,
    temp: tempDir
  }
};
