const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { 
    calculateBmi, 
    calculateBodyFat, 
    calculateCalories,
    getCalculationHistory 
} = require('../controllers/calculationController');

// @route   GET api/calculations/history
// @desc    Get all calculation history for a user
// @access  Private
router.get('/history', auth, getCalculationHistory);

// @route   POST api/calculations/bmi
// @desc    Calculate Body Mass Index and save to history
// @access  Private
router.post('/bmi', auth, calculateBmi);

// @route   POST api/calculations/bodyfat
// @desc    Calculate Body Fat Percentage and save to history
// @access  Private
router.post('/bodyfat', auth, calculateBodyFat);

// @route   POST api/calculations/calories
// @desc    Calculate Daily Calorie Needs and save to history
// @access  Private
router.post('/calories', auth, calculateCalories);


module.exports = router; 