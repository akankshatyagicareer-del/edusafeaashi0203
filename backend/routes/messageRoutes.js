const express = require('express');
const {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  getConversation
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/', protect, getMessages);
router.put('/:id/read', protect, markAsRead);
router.get('/unread-count', protect, getUnreadCount);
router.get('/conversation/:userId', protect, getConversation);

module.exports = router;