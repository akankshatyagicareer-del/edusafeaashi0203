const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number,
    required: true
  },
  // NEW: Added GIF/media support for gamification
  media: {
    type: {
      type: String,
      enum: ['gif', 'image', 'video', 'none'],
      default: 'none'
    },
    url: String,
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }
  },
  // NEW: Optional per-question time limit
  timelimitSeconds: Number
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [questionSchema],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  timeLimit: Number, // in minutes
  passingScore: {
    type: Number,
    default: 60
  },
  // NEW: Gamification fields
  category: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'tornado', 'tsunami', 'general'],
    default: 'general'
  },
  xpReward: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);