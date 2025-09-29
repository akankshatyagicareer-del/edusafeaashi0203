const mongoose = require('mongoose');

const resourceCompletionSchema = new mongoose.Schema({
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: Number // in seconds
}, { timestamps: true });

module.exports = mongoose.model('ResourceCompletion', resourceCompletionSchema);