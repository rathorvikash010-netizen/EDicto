const mongoose = require('mongoose');

const userWordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    sourceType: {
      type: String,
      enum: ['bookmark', 'revision', 'searched'],
      default: 'bookmark',
    },
    isBookmarked: {
      type: Boolean,
      default: false,
    },
    isRevision: {
      type: Boolean,
      default: false,
    },
    isLearned: {
      type: Boolean,
      default: false,
    },
    // Spaced repetition fields
    nextReview: {
      type: Date,
      default: Date.now,
    },
    interval: {
      type: Number,
      default: 1, // days
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    easeFactor: {
      type: Number,
      default: 2.5, // SM-2 starting ease
    },
    savedAt: {
      type: Date,
      default: Date.now,
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

// Each user can only have one entry per word
userWordSchema.index({ userId: 1, word: 1 }, { unique: true });

// Optimize queries for bookmarks and revision lists
userWordSchema.index({ userId: 1, isBookmarked: 1 });
userWordSchema.index({ userId: 1, isRevision: 1 });

module.exports = mongoose.model('UserWord', userWordSchema);
