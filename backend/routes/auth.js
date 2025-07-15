const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { register, login, changePassword, forgotPassword, resetPassword } = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/changepassword
// @desc    Change user password
// @access  Private
router.post('/changepassword', auth, changePassword);

// @route   POST api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', forgotPassword);

// @route   PUT api/auth/resetpassword/:token
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:token', resetPassword);

module.exports = router;