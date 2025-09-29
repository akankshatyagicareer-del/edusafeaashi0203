const Tenant = require('../models/Tenant');
const User = require('../models/User');

// @desc    Register a new tenant (school/institute)
// @route   POST /api/tenants/register
// @access  Public
const registerTenant = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role, 
      schoolName, 
      grade 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new tenant if school doesn't exist
    let tenant;
    if (schoolName) {
      tenant = new Tenant({
        name: schoolName,
        adminEmail: email,
        status: 'active'
      });
      await tenant.save();
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      tenant: tenant ? tenant._id : undefined,
      grade: grade || undefined
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        },
        tenant: tenant ? {
          id: tenant._id,
          name: tenant.name
        } : null
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

module.exports = {
  registerTenant
};