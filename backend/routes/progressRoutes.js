const express = require('express');
const { getStudentProgress, getClassProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/student/:studentId', protect, getStudentProgress);
router.get('/class', protect, authRole(['teacher']), getClassProgress);

module.exports = router;