const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    count: {
      type: Number,
      default: 0,
    },
    lastDate: {
      type: String, // YYYY-MM-DD
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Streak', streakSchema);
