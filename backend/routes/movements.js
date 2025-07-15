const express = require('express');
const router = express.Router();
const {
  getMovementsByCategory,
  toggleFavoriteMovement,
  likeMovement,
  rateMovement,
} = require('../controllers/movementController');
const auth = require('../middleware/auth');

// @route   GET api/movements/:category
// @desc    Get all movements for a specific category
// @access  Public
router.get('/:category', getMovementsByCategory);

// @route   POST api/movements/:id/favorite
// @desc    Add or remove a movement from favorites
// @access  Private
router.post('/:id/favorite', auth, toggleFavoriteMovement);

// @route   POST api/movements/:id/like
// @desc    Like or dislike a movement
// @access  Private
router.post('/:id/like', auth, likeMovement);

// @route   POST api/movements/:id/rate
// @desc    Rate a movement
// @access  Private
router.post('/:id/rate', auth, rateMovement);

module.exports = router; 