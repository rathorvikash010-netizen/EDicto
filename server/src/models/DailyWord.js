const mongoose = require('mongoose');
const { CATEGORIES } = require('../constants');

const dailyWordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: [true, 'Word is required'],
      trim: true,
    },
    partOfSpeech: {
      type: String,
      default: '',
      trim: true,
    },
    definition: {
      type: String,
      default: '',
    },
    pronunciation: {
      type: String,
      default: '',
      trim: true,
    },
    example: {
      type: String,
      default: '',
    },
    synonyms: {
      type: [String],
      default: [],
    },
    antonyms: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'GRE',
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    fetchDay: {
      type: String, // "YYYY-MM-DD" — the day this word was fetched
      required: [true, 'Fetch day is required'],
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent duplicate words within the same day (but allow same word on different days)
dailyWordSchema.index({ word: 1, fetchDay: 1 }, { unique: true });

// Fast grouping/filtering by fetchDay
dailyWordSchema.index({ fetchDay: 1 });

// TTL index — MongoDB auto-deletes documents when expiresAt is reached
dailyWordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Text search index
dailyWordSchema.index({ word: 'text' });

module.exports = mongoose.model('DailyWord', dailyWordSchema);
