const mongoose = require('mongoose');

const fetchStateSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    nextBatchIndex: {
      type: Number,
      default: 0,
    },
    lastFetchDate: {
      type: String, // YYYY-MM-DD
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FetchState', fetchStateSchema);
