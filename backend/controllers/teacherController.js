const Quiz = require('../models/Quiz');
const Drill = require('../models/Drill');
const User = require('../models/User');

// Get teacher's quizzes
const getTeacherQuizzes = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const quizzes = await Quiz.find({ createdBy: id, tenantId })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's drills
const getTeacherDrills = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const drills = await Drill.find({ createdBy: id, tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .sort({ scheduledDate: 1 });
    
    res.json(drills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher's students
const getTeacherStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const students = await User.find({ 
      tenantId, 
      role: 'student',
      isActive: true 
    }).select('firstName lastName grade');
    
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teacher dashboard data
const getTeacherDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    
    const [quizzes, drills, students] = await Promise.all([
      Quiz.countDocuments({ createdBy: id, tenantId }),
      Drill.countDocuments({ createdBy: id, tenantId }),
      User.countDocuments({ tenantId, role: 'student', isActive: true })
    ]);
    
    res.json({
      totalQuizzes: quizzes,
      totalDrills: drills,
      totalStudents: students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTeacherQuizzes, getTeacherDrills, getTeacherStudents, getTeacherDashboard };