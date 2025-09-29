const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const { getDirectorStats, getAnalyticsData } = require('../controllers/directorController');

const router = express.Router();

router.get('/stats', protect, authRole(['director']), getDirectorStats);
router.get('/analytics', protect, authRole(['director']), getAnalyticsData);

module.exports = router;