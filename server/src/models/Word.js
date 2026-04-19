const mongoose = require('mongoose');
const { CATEGORIES, DIFFICULTY_RANGE } = require('../constants');

const wordSchema = new mongoose.Schema(
  {
    word: {
      type: String,
      required: [true, 'Word is required'],
      unique: true,
      trim: true,
    },
    pronunciation: {
      type: String,
      required: [true, 'Pronunciation is required'],
      trim: true,
    },
    partOfSpeech: {
      type: String,
      required: [true, 'Part of speech is required'],
      trim: true,
    },
    meaning: {
      type: String,
      required: [true, 'Meaning is required'],
    },
    example: {
      type: String,
      required: [true, 'Example is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Category must be one of: ' + CATEGORIES.join(', '),
      },
    },
    difficulty: {
      type: Number,
      required: [true, 'Difficulty is required'],
      min: [DIFFICULTY_RANGE.min, `Difficulty must be at least ${DIFFICULTY_RANGE.min}`],
      max: [DIFFICULTY_RANGE.max, `Difficulty cannot exceed ${DIFFICULTY_RANGE.max}`],
    },
    synonyms: {
      type: [String],
      default: [],
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

// Compound index for filtered queries
wordSchema.index({ category: 1, difficulty: 1 });
wordSchema.index({ word: 'text' }); // text search

module.exports = mongoose.model('Word', wordSchema);
