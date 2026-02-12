const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true
  },
  deviceInfo: {
    userAgent: String,
    ip: String,
    platform: String,
    browser: String,
    os: String,
    location: {
      country: String,
      city: String
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Indexes
sessionSchema.index({ userId: 1 });
sessionSchema.index({ token: 1 });
sessionSchema.index({ refreshToken: 1 });
sessionSchema.index({ expiresAt: 1 });

// TTL index to automatically remove expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods
sessionSchema.statics.findActiveByToken = function(token) {
  return this.findOne({ token, isActive: true, expiresAt: { $gt: new Date() } })
    .populate('userId', 'firstName lastName email role status emailVerified');
};

sessionSchema.statics.findActiveByRefreshToken = function(refreshToken) {
  return this.findOne({ refreshToken, isActive: true, expiresAt: { $gt: new Date() } })
    .populate('userId', 'firstName lastName email role status emailVerified');
};

// Instance methods
sessionSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
  return this.save();
};

sessionSchema.methods.deactivate = function() {
  this.isActive = false;
  return this.save();
};

module.exports = mongoose.model('Session', sessionSchema);