const User = require('../models/User');

// @desc    Get users by role
// @route   GET /api/users
// @access  Private
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    const { tenantId } = req.user;

    if (!role) {
      return res.status(400).json({ message: 'Role parameter is required' });
    }

    const users = await User.find({ 
      tenantId, 
      role,
      isActive: true 
    }).select('firstName lastName email role grade');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const user = await User.findOne({ 
      _id: id, 
      tenantId 
    }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getUsersByRole, getUserById };