const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  likeRecipe,
  dislikeRecipe,
  addComment,
  deleteComment,
  toggleFavoriteRecipe
} = require('../controllers/recipeController');

// @route   GET api/recipes
// @desc    Get all recipes
// @access  Public
router.get('/', getAllRecipes);

// @route   GET api/recipes/:id
// @desc    Get recipe by ID
// @access  Public
router.get('/:id', getRecipeById);

// @route   POST api/recipes
// @desc    Create a recipe (suggest)
// @access  Private
router.post('/', auth, createRecipe);

// @route   PUT api/recipes/:id/like
// @desc    Like or unlike a recipe
// @access  Private
router.put('/:id/like', auth, likeRecipe);

// @route   PUT api/recipes/:id/dislike
// @desc    Dislike or un-dislike a recipe
// @access  Private
router.put('/:id/dislike', auth, dislikeRecipe);

// @route   PUT api/recipes/:id/favorite
// @desc    Toggle favorite status for a recipe
// @access  Private
router.put('/:id/favorite', auth, toggleFavoriteRecipe);

// @route   POST api/recipes/:id/comment
// @desc    Comment on a recipe
// @access  Private
router.post('/:id/comment', auth, addComment);

// @route   DELETE api/recipes/:recipeId/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:recipeId/comments/:commentId', auth, deleteComment);


module.exports = router; 