const express = require('express');
const { getDrills, createDrill, updateDrillStatus, deleteDrill } = require('../controllers/drillController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getDrills)
  .post(protect, authRole(['teacher']), createDrill);

router.put('/:id/status', protect, authRole(['teacher']), updateDrillStatus);
router.delete('/:id', protect, authRole(['teacher']), deleteDrill);

module.exports = router;