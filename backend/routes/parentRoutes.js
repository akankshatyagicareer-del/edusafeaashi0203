// backend/routes/parentRoutes.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const { 
  getParentStudentProgress,
  getParentEmergencyContacts 
} = require('../controllers/parentController');

const router = express.Router();

// Match the frontend API call: /parents/:id/student-progress
router.get('/:id/student-progress', protect, authRole(['parent']), getParentStudentProgress);
router.get('/:id/emergency-contacts', protect, authRole(['parent']), getParentEmergencyContacts);

module.exports = router;