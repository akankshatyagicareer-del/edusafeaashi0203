const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Tenant = require('../models/Tenant');
const User = require('../models/User');

// ===============================
// Register New Tenant (School/Institute) - SIMPLIFIED
// ===============================
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('schoolName').notEmpty().withMessage('School name is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    try {
      const { 
        firstName, 
        lastName, 
        email, 
        password, 
        schoolName, 
        grade 
      } = req.body;

      console.log('Received tenant registration:', req.body);

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Check if tenant already exists
      const existingTenant = await Tenant.findOne({ name: schoolName });
      if (existingTenant) {
        return res.status(400).json({
          success: false,
          message: 'School/Institute already exists'
        });
      }

      // Create new tenant
      const tenant = new Tenant({
        name: schoolName,
        address: 'Address to be updated', // Can be updated later
        contactEmail: email,
        contactPhone: '0000000000', // Can be updated later
        adminEmail: email,
        isActive: true
      });
      await tenant.save();

      // Create new user (as director)
      const user = new User({
        firstName,
        lastName,
        email,
        password,
        role: 'director',
        tenantId: tenant._id,
        grade: grade || '',
        isActive: true
      });

      await user.save();

      res.status(201).json({
        success: true,
        message: 'School registered successfully',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          },
          tenant: {
            id: tenant._id,
            name: tenant.name
          }
        }
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
      });
    }
  }
);

// ===============================
// Get All Schools for Dropdown
// ===============================
router.get('/schools/list', async (req, res) => {
  try {
    const schools = await Tenant.find({ isActive: true })
      .select('name _id contactEmail')
      .sort({ name: 1 });
    
    res.json({
      success: true,
      data: schools
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching schools',
      error: error.message
    });
  }
});

// ... rest of your existing routes remain the same
// ===============================
// Create Tenant (Admin Only)
// ===============================
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('contactEmail').isEmail().withMessage('Valid email is required'),
    body('contactPhone')
      .isLength({ min: 10, max: 15 })
      .withMessage('Contact phone must be between 10–15 digits')
      .matches(/^[0-9]+$/)
      .withMessage('Contact phone must contain only numbers'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, contactEmail, contactPhone, isActive } = req.body;

      const tenant = new Tenant({
        name,
        address,
        contactEmail,
        contactPhone,
        isActive: isActive ?? true,
      });

      await tenant.save();
      res.status(201).json({
        success: true,
        data: tenant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating tenant',
        error: error.message
      });
    }
  }
);

// ===============================
// Get all Tenants
// ===============================
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tenants',
      error: error.message
    });
  }
});

// ===============================
// Get Tenant by ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tenant',
      error: error.message
    });
  }
});

// ===============================
// Update Tenant by ID
// ===============================
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('contactEmail').optional().isEmail().withMessage('Valid email is required'),
    body('contactPhone')
      .optional()
      .isLength({ min: 10, max: 15 })
      .withMessage('Contact phone must be between 10–15 digits')
      .matches(/^[0-9]+$/)
      .withMessage('Contact phone must contain only numbers'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, contactEmail, contactPhone, isActive } = req.body;

      const tenant = await Tenant.findByIdAndUpdate(
        req.params.id,
        { name, address, contactEmail, contactPhone, isActive },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating tenant',
        error: error.message
      });
    }
  }
);

// ===============================
// Delete Tenant by ID
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant not found'
      });
    }

    res.json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tenant',
      error: error.message
    });
  }
});

module.exports = router;