const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');
const ResourceCompletion = require('../models/ResourceCompletion');
const Tenant = require('../models/Tenant');

// Get student details
const getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const student = await User.findOne({ _id: id, tenantId }).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's quiz submissions
const getStudentQuizSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verify student belongs to the same tenant
    const student = await User.findOne({ _id: id, tenantId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const submissions = await QuizSubmission.find({ studentId: id })
      .populate('quizId')
      .sort({ completedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's completed resources
const getStudentCompletedResources = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verify student belongs to the same tenant
    const student = await User.findOne({ _id: id, tenantId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const completions = await ResourceCompletion.find({ studentId: id })
      .populate('resourceId')
      .sort({ completedAt: -1 });
    
    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get student's emergency contacts
const getStudentEmergencyContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    // Verify student belongs to the same tenant
    const student = await User.findOne({ _id: id, tenantId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    const tenant = await Tenant.findById(tenantId);
    res.json(tenant.emergencyContacts || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getStudentDetails, 
  getStudentQuizSubmissions, 
  getStudentCompletedResources, 
  getStudentEmergencyContacts 
};