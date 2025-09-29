const express = require('express');
const {
  registerUser,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (teacher, student, parent)
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged in user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user (for frontend auth persistence)
 * @access  Private
 */
router.get('/me', protect, getUserProfile);

module.exports = router;