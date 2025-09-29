const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    // UPDATED: Added 'gif' to supported types
    enum: ['article', 'video', 'pdf', 'guideline', 'file', 'gif'],
    required: true
  },
  content: {
    type: String,
    required: true // URL or text content
  },
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
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  // NEW: For GIF-specific properties
  thumbnail: String,
  duration: Number // in seconds for videos/gifs
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);