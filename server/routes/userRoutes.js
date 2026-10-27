const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * @route   GET /api/users
 * @desc    Get all registered users (for Member 4 authentication/admin coordination)
 */
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-__v');
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/users
 * @desc    Register a user
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, studentId, phone, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const newUser = new User({ name, email, studentId, phone, role });
    const saved = await newUser.save();
    res.status(201).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
