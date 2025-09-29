const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const { 
  getTeacherQuizzes, 
  getTeacherDrills, 
  getTeacherStudents,
  getTeacherDashboard 
} = require('../controllers/teacherController');

const router = express.Router();

router.get('/:id/quizzes', protect, authRole(['teacher']), getTeacherQuizzes);
router.get('/:id/drills', protect, authRole(['teacher']), getTeacherDrills);
router.get('/:id/students', protect, authRole(['teacher']), getTeacherStudents);
router.get('/:id/dashboard', protect, authRole(['teacher']), getTeacherDashboard);

module.exports = router;