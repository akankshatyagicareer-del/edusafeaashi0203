const express = require('express');
const { getUsersByRole, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUsersByRole);
router.get('/:id', protect, getUserById);

module.exports = router;