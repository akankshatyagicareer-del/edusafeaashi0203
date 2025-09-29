const express = require('express');
const { sendAlert, getAlerts, updateAlertStatus, dismissAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authRole(['director', 'teacher', 'student']), sendAlert)
  .get(protect, getAlerts);

// Dismiss an alert (for any logged-in user)
router.put('/:id/dismiss', protect, dismissAlert);

// Update alert status (directors/teachers can update status like "resolved")
router.put('/:id/status', protect, authRole(['director', 'teacher']), updateAlertStatus);

module.exports = router;
