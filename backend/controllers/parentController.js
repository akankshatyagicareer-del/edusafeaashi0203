// backend/controllers/parentController.js
const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');
const ResourceCompletion = require('../models/ResourceCompletion');
const Quiz = require('../models/Quiz');
const Resource = require('../models/Resource');
const Tenant = require('../models/Tenant');

// Get parent's child progress
const getParentStudentProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const parent = await User.findOne({ _id: id, tenantId });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    if (!parent.studentId) {
      return res.status(404).json({ message: 'No student linked to parent account' });
    }
    
    const student = await User.findById(parent.studentId);
    if (!student || student.tenantId.toString() !== tenantId.toString()) {
      return res.status(404).json({ message: 'Student not found or access denied' });
    }
    
    const quizSubmissions = await QuizSubmission.find({ studentId: parent.studentId })
      .populate('quizId')
      .sort({ completedAt: -1 });
    
    const resourceCompletions = await ResourceCompletion.find({ studentId: parent.studentId })
      .populate('resourceId')
      .sort({ completedAt: -1 });
    
    const totalQuizzes = await Quiz.countDocuments({ tenantId });
    const totalResources = await Resource.countDocuments({ tenantId, isPublic: true });
    
    const completedQuizzes = quizSubmissions.length;
    const completedResources = resourceCompletions.length;
    
    const quizProgress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
    const resourceProgress = totalResources > 0 ? (completedResources / totalResources) * 100 : 0;
    const overallProgress = (quizProgress + resourceProgress) / 2;
    
    const averageScore = quizSubmissions.length > 0 
      ? quizSubmissions.reduce((sum, submission) => sum + submission.score, 0) / quizSubmissions.length 
      : 0;
    
    res.json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        school: student.school || 'Not specified'
      },
      progress: {
        overall: Math.round(overallProgress),
        quizzes: Math.round(quizProgress),
        resources: Math.round(resourceProgress),
        averageScore: Math.round(averageScore)
      },
      quizSubmissions,
      resourceCompletions
    });
  } catch (error) {
    console.error('Error in getParentStudentProgress:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get parent's emergency contacts
const getParentEmergencyContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const parent = await User.findOne({ _id: id, tenantId });
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Get tenant information
    const tenant = await Tenant.findById(tenantId);
    
    // Get director information
    const director = await User.findOne({ 
      tenantId, 
      role: 'director',
      isActive: true 
    }).select('firstName lastName email phone');
    
    // Get teacher information
    const teacher = await User.findOne({ 
      tenantId, 
      role: 'teacher',
      isActive: true 
    }).select('firstName lastName email phone');
    
    res.json({
      emergencyContacts: tenant.emergencyContacts || [],
      schoolInfo: {
        name: tenant.name,
        contactEmail: tenant.contactEmail,
        contactPhone: tenant.contactPhone,
        address: tenant.address
      },
      director: director ? {
        firstName: director.firstName,
        lastName: director.lastName,
        email: director.email,
        phone: director.phone || tenant.contactPhone // Fallback to school phone
      } : null,
      teacher: teacher ? {
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        phone: teacher.phone || tenant.contactPhone // Fallback to school phone
      } : null
    });
  } catch (error) {
    console.error('Error in getParentEmergencyContacts:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getParentStudentProgress, getParentEmergencyContacts };