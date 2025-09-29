const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  targetRoles: [{
    type: String,
    enum: ['director', 'teacher', 'student', 'parent'],
    required: true
  }],
  emergencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active'
  },
  dismissed: {
    type: Boolean,
    default: false
  },
  sent: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index for better query performance
alertSchema.index({ tenantId: 1, createdAt: -1 });
alertSchema.index({ tenantId: 1, status: 1 });
alertSchema.index({ tenantId: 1, dismissed: 1 });

module.exports = mongoose.model('Alert', alertSchema);