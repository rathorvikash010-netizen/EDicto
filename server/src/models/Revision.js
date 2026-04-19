const mongoose = require('mongoose');
const { LIMITS } = require('../constants');

const revisionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Word',
      required: true,
    },
    addedDate: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    nextReview: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    interval: {
      type: Number,
      default: 1,
      min: 1,
      max: LIMITS.MAX_REVISION_INTERVAL,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicates and optimize due-today queries
revisionSchema.index({ userId: 1, wordId: 1 }, { unique: true });
revisionSchema.index({ userId: 1, nextReview: 1 });

module.exports = mongoose.model('Revision', revisionSchema);
