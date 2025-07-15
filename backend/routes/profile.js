const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  getMyProfile,
  createOrUpdateProfile,
  getFavoriteRecipes,
  getFavoriteMovements, // Yeni fonksiyonu ekle
  uploadAvatar,
  removeAvatar, // Add this
} = require('../controllers/profileController');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appending extension
  },
});

// Multer file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb('Error: File type not supported!');
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB limit
});

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private
router.get('/me', auth, getMyProfile);

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', auth, createOrUpdateProfile);

// @route   POST api/profile/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', [auth, upload.single('avatar')], uploadAvatar);

// @route   DELETE api/profile/avatar
// @desc    Remove user avatar
// @access  Private
router.delete('/avatar', auth, removeAvatar);

// @route   GET api/profile/favorites
// @desc    Get user's favorite recipes
// @access  Private
router.get('/favorites', auth, getFavoriteRecipes);

// @route   GET api/profile/favorite-movements
// @desc    Get user's favorite movements
// @access  Private
router.get('/favorite-movements', auth, getFavoriteMovements);

module.exports = router; 