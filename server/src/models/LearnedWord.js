const mongoose = require('mongoose');

const learnedWordSchema = new mongoose.Schema(
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
    learnedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries
learnedWordSchema.index({ userId: 1, wordId: 1 }, { unique: true });

module.exports = mongoose.model('LearnedWord', learnedWordSchema);
