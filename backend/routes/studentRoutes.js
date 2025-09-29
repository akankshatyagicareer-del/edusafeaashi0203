const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/students
// @desc    Get students by tenant (school) for parent registration
// @access  Public (for registration) - Changed from protect to public
router.get('/', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Tenant ID is required'
      });
    }

    // Verify tenant exists
    const tenant = await require('../models/Tenant').findById(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'School/Institute not found'
      });
    }

    // Find all active students in the specified school
    const students = await User.find({
      role: 'student',
      tenantId: tenantId,
      isActive: true
    }).select('firstName lastName email grade _id phone')
    .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: students,
      count: students.length,
      school: tenant.name
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id
// @desc    Get student details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await User.findById(studentId)
      .select('-password')
      .populate('tenantId', 'name address contactEmail')
      .populate('parents', 'firstName lastName email phone');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Ensure the user has permission to view this student
    if (req.user.role === 'parent' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student'
      });
    }

    // For teachers/directors, ensure they belong to the same school
    if (['teacher', 'director'].includes(req.user.role) && 
        req.user.tenantId.toString() !== student.tenantId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view students from other schools'
      });
    }

    res.json({
      success: true,
      data: student
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching student details',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id/parents
// @desc    Get parents of a specific student
// @access  Private
router.get('/:id/parents', protect, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Verify student exists and belongs to same school
    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      tenantId: req.user.tenantId
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const parents = await User.find({
      studentId: studentId,
      role: 'parent',
      isActive: true
    }).select('firstName lastName email phone createdAt')
    .sort({ firstName: 1 });

    res.json({
      success: true,
      data: parents,
      count: parents.length,
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade
      }
    });

  } catch (error) {
    console.error('Error fetching parents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching parents',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id/quiz-submissions
// @desc    Get student quiz submissions
// @access  Private
router.get('/:id/quiz-submissions', protect, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Authorization check
    if (req.user.role === 'parent' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student\'s quiz submissions'
      });
    }

    // TODO: Replace with actual quiz submission model
    const quizSubmissions = []; // await QuizSubmission.find({ studentId })

    res.json({
      success: true,
      data: quizSubmissions,
      count: quizSubmissions.length,
      message: 'Quiz submissions endpoint - implement with your QuizSubmission model'
    });

  } catch (error) {
    console.error('Error fetching quiz submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz submissions',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id/completed-resources
// @desc    Get student completed resources
// @access  Private
router.get('/:id/completed-resources', protect, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Authorization check
    if (req.user.role === 'parent' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student\'s completed resources'
      });
    }

    // TODO: Replace with actual resource completion model
    const completedResources = []; // await ResourceCompletion.find({ studentId })

    res.json({
      success: true,
      data: completedResources,
      count: completedResources.length,
      message: 'Completed resources endpoint - implement with your ResourceCompletion model'
    });

  } catch (error) {
    console.error('Error fetching completed resources:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed resources',
      error: error.message
    });
  }
});

// @route   GET /api/students/:id/emergency-contacts
// @desc    Get student emergency contacts
// @access  Private
router.get('/:id/emergency-contacts', protect, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Authorization check
    if (req.user.role === 'parent' && req.user.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this student\'s emergency contacts'
      });
    }

    // Get parents as emergency contacts
    const emergencyContacts = await User.find({
      studentId: studentId,
      role: 'parent',
      isActive: true
    }).select('firstName lastName email phone relationship')
    .sort({ firstName: 1 });

    res.json({
      success: true,
      data: emergencyContacts,
      count: emergencyContacts.length,
      student: {
        id: studentId,
        name: `${req.user.firstName} ${req.user.lastName}`
      }
    });

  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts',
      error: error.message
    });
  }
});

module.exports = router;