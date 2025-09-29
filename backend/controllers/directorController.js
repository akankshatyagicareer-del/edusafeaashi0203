const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Resource = require('../models/Resource');
const Drill = require('../models/Drill');
const Alert = require('../models/Alert');
const QuizSubmission = require('../models/QuizSubmission');
const ResourceCompletion = require('../models/ResourceCompletion');

// Get director dashboard statistics
const getDirectorStats = async (req, res) => {
  try {
    const { tenantId } = req.user;
    
    const [
      totalStudents,
      totalTeachers,
      totalResources,
      totalQuizzes,
      totalDrills,
      activeAlerts
    ] = await Promise.all([
      User.countDocuments({ tenantId, role: 'student', isActive: true }),
      User.countDocuments({ tenantId, role: 'teacher', isActive: true }),
      Resource.countDocuments({ tenantId }),
      Quiz.countDocuments({ tenantId }),
      Drill.countDocuments({ tenantId }),
      Alert.countDocuments({ tenantId, dismissed: { $ne: true } }) // FIXED: Use same filter as Alert System
    ]);
    
    res.json({
      totalStudents,
      totalTeachers,
      totalResources,
      totalQuizzes,
      totalDrills,
      activeAlerts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// NEW: Get comprehensive analytics data
const getAnalyticsData = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { timeRange = '7days' } = req.query;

    // Calculate date range
    const days = timeRange === '30days' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get basic counts - separate students from all users
    const [allUsers, students, resources, quizzes, drills, alerts] = await Promise.all([
      User.find({ tenantId, isActive: true }),
      User.find({ tenantId, role: 'student', isActive: true }), // Only students
      Resource.find({ tenantId }),
      Quiz.find({ tenantId }),
      Drill.find({ tenantId }),
      Alert.find({ tenantId, dismissed: { $ne: true } }) // FIXED: Use same filter as Alert System
    ]);

    // Get quiz submissions for the period
    const quizSubmissions = await QuizSubmission.find({
      createdAt: { $gte: startDate }
    }).populate('quizId').populate('studentId');

    // Get resource completions for the period
    const resourceCompletions = await ResourceCompletion.find({
      createdAt: { $gte: startDate }
    }).populate('resourceId').populate('studentId');

    // Generate user activity data (focus on students)
    const userActivity = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i - 1));
      const dateStr = date.toISOString().split('T')[0];

      // Count active STUDENTS for this date (students who completed quizzes or resources)
      const activeStudents = new Set();
      
      quizSubmissions.forEach(submission => {
        const submissionDate = submission.createdAt.toISOString().split('T')[0];
        if (submissionDate === dateStr) {
          activeStudents.add(submission.studentId._id.toString());
        }
      });

      resourceCompletions.forEach(completion => {
        const completionDate = completion.createdAt.toISOString().split('T')[0];
        if (completionDate === dateStr) {
          activeStudents.add(completion.studentId._id.toString());
        }
      });

      userActivity.push({
        date: date.toLocaleDateString(),
        activeUsers: activeStudents.size, // Now shows active students only
        newRegistrations: students.filter(u => 
          u.createdAt.toISOString().split('T')[0] === dateStr
        ).length // Only count new student registrations
      });
    }

    // Generate resource usage data
    const resourceUsage = resources.slice(0, 10).map(resource => {
      const completions = resourceCompletions.filter(rc => 
        rc.resourceId?._id.toString() === resource._id.toString()
      );
      
      return {
        name: resource.title,
        views: Math.floor(Math.random() * 1000), // This would need actual view tracking
        completions: completions.length,
        completionRate: completions.length > 0 ? 
          Math.round((completions.length / students.length) * 100) : 0 // Use student count for rate calculation
      };
    });

    // Generate quiz performance data
    const quizPerformance = quizzes.map(quiz => {
      const submissions = quizSubmissions.filter(qs => 
        qs.quizId?._id.toString() === quiz._id.toString()
      );
      
      const avgScore = submissions.length > 0 ?
        submissions.reduce((sum, sub) => sum + sub.score, 0) / submissions.length : 0;

      return {
        category: quiz.title,
        averageScore: Math.round(avgScore),
        participants: submissions.length,
        totalQuestions: quiz.questions.length
      };
    });

    // System metrics - UPDATED: totalUsers now shows only students
    const systemMetrics = {
      totalUsers: students.length, // Now shows only student count
      activeUsers: students.filter(u => u.lastActive).length, // Active students only
      totalResources: resources.length,
      activeAlerts: alerts.length, // FIXED: Now uses the same filter as Alert System
      avgQuizScore: quizSubmissions.length > 0 ?
        Math.round(quizSubmissions.reduce((sum, sub) => sum + sub.score, 0) / quizSubmissions.length) : 0,
      totalCompletions: resourceCompletions.length,
      engagementRate: students.length > 0 ? 
        Math.round((new Set([...quizSubmissions.map(qs => qs.studentId), ...resourceCompletions.map(rc => rc.studentId)]).size / students.length) * 100) : 0
    };

    res.json({
      userActivity,
      resourceUsage: resourceUsage.sort((a, b) => b.completions - a.completions).slice(0, 5),
      quizPerformance: quizPerformance.sort((a, b) => b.averageScore - a.averageScore).slice(0, 5),
      systemMetrics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getDirectorStats,
  getAnalyticsData 
};