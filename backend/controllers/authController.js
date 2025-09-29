const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      tenantId,
      studentId,
      grade,
      phone
    } = req.body;

    console.log('Registration attempt:', { firstName, lastName, email, role, tenantId, studentId, grade });

    // Basic validation
    if (!firstName || !lastName || !email || !password || !role || !tenantId) {
      return res.status(400).json({ 
        success: false,
        message: "All required fields must be provided" 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Check if tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(400).json({ 
        success: false,
        message: "School/Institute not found" 
      });
    }

    // Extra validations for role-specific fields
    if (role === "student" && !grade) {
      return res.status(400).json({ 
        success: false,
        message: "Grade is required for students" 
      });
    }

    // Enhanced validation for parents
    if (role === "parent") {
      if (!studentId) {
        return res.status(400).json({ 
          success: false,
          message: "Student selection is required for parents" 
        });
      }

      // Verify the student exists and belongs to the same tenant
      const student = await User.findOne({
        _id: studentId,
        role: 'student',
        tenantId: tenantId,
        isActive: true
      });

      if (!student) {
        return res.status(400).json({ 
          success: false,
          message: "Selected student not found or does not belong to this school" 
        });
      }

      // Check if parent email is already linked to this student
      const existingParent = await User.findOne({
        studentId: studentId,
        role: 'parent',
        email: email
      });

      if (existingParent) {
        return res.status(400).json({ 
          success: false,
          message: "A parent with this email is already linked to the selected student" 
        });
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      tenantId,
      studentId: role === "parent" ? studentId : undefined,
      grade: role === "student" ? grade : undefined,
      phone: phone || undefined,
      school: tenant.name // Set school name from tenant
    });

    // Populate student info for parent response
    let userResponse = user.toObject();
    
    if (role === 'parent') {
      const studentInfo = await User.findById(studentId)
        .select('firstName lastName grade email');
      userResponse.student = studentInfo;
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          grade: user.grade,
          studentId: user.studentId,
          phone: user.phone,
          school: user.school,
          student: userResponse.student
        },
        token: generateToken(user._id),
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

// @desc    Register a new tenant (institute) - Updated for new flow
// @route   POST /api/tenants/register
// @access  Public
const registerTenant = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      schoolName,
      grade
    } = req.body;

    console.log('Tenant registration attempt:', { firstName, lastName, email, schoolName });

    if (!firstName || !lastName || !email || !password || !schoolName) {
      return res.status(400).json({ 
        success: false,
        message: "All required fields must be provided" 
      });
    }

    // Check if tenant exists
    const tenantExists = await Tenant.findOne({ name: schoolName });
    if (tenantExists) {
      return res.status(400).json({ 
        success: false,
        message: "School/Institute already exists" 
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: "User already exists with this email" 
      });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name: schoolName,
      address: 'Address to be updated', // Can be updated later
      contactEmail: email,
      contactPhone: '0000000000', // Can be updated later
      adminEmail: email,
      isActive: true
    });

    // Create director user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: "director",
      tenantId: tenant._id,
      grade: grade || '',
      school: schoolName
    });

    res.status(201).json({
      success: true,
      message: 'School registered successfully',
      data: {
        tenant: {
          _id: tenant._id,
          name: tenant.name,
          contactEmail: tenant.contactEmail
        },
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          school: user.school
        },
        token: generateToken(user._id),
      }
    });

  } catch (error) {
    console.error('Tenant registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'School or user already exists'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({ 
      success: false,
      message: "School registration failed",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user and populate tenant info
    const user = await User.findOne({ email })
      .populate("tenantId")
      .populate("student", "firstName lastName grade");

    if (user && (await user.matchPassword(password))) {
      
      // For parents, ensure we have student info
      let userResponse = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenantId,
        grade: user.grade,
        studentId: user.studentId,
        phone: user.phone,
        school: user.school,
        token: generateToken(user._id),
      };

      // Add student info for parents
      if (user.role === 'parent' && user.student) {
        userResponse.student = user.student;
      }

      res.json({
        success: true,
        data: userResponse
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("tenantId")
      .populate("student", "firstName lastName grade email");

    if (user) {
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch profile",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

// @desc    Get current user (for auth persistence)
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("tenantId")
      .populate("student", "firstName lastName grade email");

    if (user) {
      res.json({
        success: true,
        data: user
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch user data",
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
    });
  }
};

module.exports = { 
  registerUser, 
  registerTenant, 
  loginUser, 
  getUserProfile,
  getCurrentUser 
};