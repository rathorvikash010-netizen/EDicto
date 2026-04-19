const mongoose = require('mongoose');
const { ACTIVITY_ACTIONS } = require('../constants');

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ACTIVITY_ACTIONS,
    },
    word: {
      type: String, // word text or quiz score string like "8/10"
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // using custom timestamp field
  }
);

// Optimize recent activity queries
activitySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Activity', activitySchema);
