const User = require('../models/User');
const QuizSubmission = require('../models/QuizSubmission');
const ResourceCompletion = require('../models/ResourceCompletion');
const Quiz = require('../models/Quiz'); // ADDED: Missing import
const Resource = require('../models/Resource'); // ADDED: Missing import

// @desc    Get student progress
// @route   GET /api/progress/student/:studentId
// @access  Private
const getStudentProgress = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { tenantId, role, _id: userId } = req.user;

    // Check if user has permission to view this student's progress
    if (role === 'parent') {
      const parent = await User.findById(userId);
      if (parent.studentId.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    } else if (role === 'student' && userId.toString() !== studentId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student || student.tenantId.toString() !== tenantId.toString()) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get quiz submissions
    const quizSubmissions = await QuizSubmission.find({ studentId })
      .populate('quizId')
      .sort({ completedAt: -1 });

    // Get resource completions
    const resourceCompletions = await ResourceCompletion.find({ studentId })
      .populate('resourceId')
      .sort({ completedAt: -1 });

    // Calculate overall progress
    const totalQuizzes = await Quiz.countDocuments({ tenantId });
    const totalResources = await Resource.countDocuments({ tenantId, isPublic: true });

    const completedQuizzes = quizSubmissions.length;
    const completedResources = resourceCompletions.length;

    const quizProgress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
    const resourceProgress = totalResources > 0 ? (completedResources / totalResources) * 100 : 0;
    const overallProgress = (quizProgress + resourceProgress) / 2;

    // Get average quiz score
    const averageScore = quizSubmissions.length > 0 
      ? quizSubmissions.reduce((sum, submission) => sum + submission.score, 0) / quizSubmissions.length 
      : 0;

    res.json({
      student: {
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade
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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class progress (for teachers)
// @route   GET /api/progress/class
// @access  Private (Teacher only)
const getClassProgress = async (req, res) => {
  try {
    const { tenantId } = req.user;

    // Get all students in the tenant
    const students = await User.find({ 
      tenantId, 
      role: 'student',
      isActive: true 
    });

    // Get progress for each student
    const classProgress = await Promise.all(
      students.map(async (student) => {
        const quizSubmissions = await QuizSubmission.find({ studentId: student._id });
        const resourceCompletions = await ResourceCompletion.find({ studentId: student._id });

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

        return {
          student: {
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade
          },
          progress: {
            overall: Math.round(overallProgress),
            quizzes: Math.round(quizProgress),
            resources: Math.round(resourceProgress),
            averageScore: Math.round(averageScore)
          },
          completedQuizzes,
          completedResources
        };
      })
    );

    res.json(classProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentProgress, getClassProgress };