const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Check file type
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  fileFilter: fileFilter
});

// Create fields array for multiple file inputs
const uploadFields = upload.fields([
  { name: 'attachment1', maxCount: 1 },
  { name: 'attachment2', maxCount: 1 },
  { name: 'attachment3', maxCount: 1 }
]);

// Export both single and multiple upload middlewares
module.exports = {
  uploadFields,
  upload
};
