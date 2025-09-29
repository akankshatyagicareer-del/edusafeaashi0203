const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const mongoose = require('mongoose');


// @desc    Get a single quiz
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, resourceId, timeLimit, passingScore, category, xpReward } = req.body;
    const { _id: createdBy, tenantId } = req.user;

    // Validate questions with media
    const validatedQuestions = questions.map(q => ({
      ...q,
      media: q.media || { type: 'none' }
    }));

    const quiz = await Quiz.create({
      title,
      description,
      questions: validatedQuestions,
      resourceId,
      timeLimit,
      passingScore,
      category,
      xpReward,
      tenantId,
      createdBy
    });

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId');

    res.status(201).json(populatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for a tenant
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const quizzes = await Quiz.find({ tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher only)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId, tenantId } = req.user;

    const quiz = await Quiz.findOne({ _id: id, tenantId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Optional: Check if the user is the creator of the quiz
    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    // Delete associated submissions first
    await QuizSubmission.deleteMany({ quizId: id });
    
    // Then delete the quiz
    await Quiz.findByIdAndDelete(id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student only)
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    const { _id: studentId } = req.user;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate score
    let correctAnswers = 0;
    const answerResults = answers.map((answer, index) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    const submission = await QuizSubmission.create({
      quizId: id,
      studentId,
      answers: answerResults,
      score,
      timeTaken
    });

    const populatedSubmission = await QuizSubmission.findById(submission._id)
      .populate('quizId')
      .populate('studentId', 'firstName lastName');

    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz submissions
// @route   GET /api/quizzes/submissions/:quizId
// @access  Private
const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { role, tenantId, _id: userId } = req.user;

    let query = { quizId };
    
    // Students can only see their own submissions
    if (role === 'student') {
      query.studentId = userId;
    }
    
    const submissions = await QuizSubmission.find(query)
      .populate('studentId', 'firstName lastName')
      .populate('quizId')
      .sort({ completedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/leaderboard/:quizId
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // FIXED: Use new mongoose.Types.ObjectId() instead of mongoose.Types.ObjectId()
    const leaderboard = await QuizSubmission.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$studentId',
          firstName: { $first: '$student.firstName' },
          lastName: { $first: '$student.lastName' },
          bestScore: { $max: '$score' },
          attempts: { $sum: 1 },
          lastAttempt: { $max: '$completedAt' }
        }
      },
      { $sort: { bestScore: -1, lastAttempt: 1 } }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { 
  getQuizzes, 
  getQuiz, 
  createQuiz, 
  deleteQuiz,
  submitQuiz, 
  getQuizSubmissions, 
  getLeaderboard 
};