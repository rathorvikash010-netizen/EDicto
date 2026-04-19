const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 1,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    answers: {
      type: [Boolean],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Optimize history queries (most recent first)
quizResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
