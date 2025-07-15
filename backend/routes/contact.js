const express = require('express');
const router = express.Router();
const { askQuestion, subscribe, suggestRecipe } = require('../controllers/contactController');

// @route   POST api/contact/ask
// @desc    Submit a question from the contact form
// @access  Public
router.post('/ask', askQuestion);

// @route   POST api/contact/subscribe
// @desc    Submit a subscription/contact request from the footer
// @access  Public
router.post('/subscribe', subscribe);

// @route   POST api/contact/suggest-recipe
// @desc    Submit a recipe suggestion from the contact form
// @access  Public
router.post('/suggest-recipe', suggestRecipe);

module.exports = router; 