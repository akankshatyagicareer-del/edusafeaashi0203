const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, subject, message } = req.body;
    const { _id: senderId, tenantId } = req.user;

    // Check if receiver exists and belongs to same tenant
    const receiver = await User.findOne({ _id: receiverId, tenantId });
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Teachers can message students, students can message teachers
    const isValidCommunication = 
      (req.user.role === 'teacher' && receiver.role === 'student') ||
      (req.user.role === 'student' && receiver.role === 'teacher');

    if (!isValidCommunication) {
      return res.status(403).json({ 
        message: 'You can only message teachers if you are a student, or students if you are a teacher' 
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      subject,
      message,
      tenantId
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'firstName lastName role')
      .populate('receiver', 'firstName lastName role');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's messages (both sent and received)
// @route   GET /api/messages
// @access  Private
const getMessages = async (req, res) => {
  try {
    const { _id: userId, tenantId } = req.user;
    const { type = 'received' } = req.query; // 'sent' or 'received'

    let query = { tenantId };
    
    if (type === 'sent') {
      query.sender = userId;
    } else {
      query.receiver = userId;
    }

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName role')
      .populate('receiver', 'firstName lastName role')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId } = req.user;

    const message = await Message.findOne({ 
      _id: id, 
      receiver: userId 
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'firstName lastName role')
      .populate('receiver', 'firstName lastName role');

    res.json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const { _id: userId, tenantId } = req.user;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      tenantId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/conversation/:userId
// @access  Private
const getConversation = async (req, res) => {
  try {
    const { userId: otherUserId } = req.params;
    const { _id: currentUserId, tenantId } = req.user;

    const messages = await Message.find({
      tenantId,
      $or: [
        { sender: currentUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'firstName lastName role')
      .populate('receiver', 'firstName lastName role')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  markAsRead,
  getUnreadCount,
  getConversation
};