const Joi = require('joi');
const { CATEGORIES, DIFFICULTY_RANGE } = require('../constants');

const getWords = {
  query: Joi.object({
    category: Joi.string().valid(...CATEGORIES),
    difficulty: Joi.number().integer().min(DIFFICULTY_RANGE.min).max(DIFFICULTY_RANGE.max),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(200).default(20),
  }),
};

const getById = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required()
      .messages({ 'string.length': 'Invalid word ID format' }),
  }),
};

const getRandom = {
  query: Joi.object({
    exclude: Joi.string().hex().length(24),
    limit: Joi.number().integer().min(1).max(20).default(4),
  }),
};

const addWord = {
  body: Joi.object({
    word: Joi.string().trim().min(2).max(50).required()
      .messages({ 'any.required': 'Word is required' }),
    category: Joi.string().valid(...CATEGORIES).required()
      .messages({ 'any.required': 'Category is required', 'any.only': `Category must be one of: ${CATEGORIES.join(', ')}` }),
    difficulty: Joi.number().integer().min(DIFFICULTY_RANGE.min).max(DIFFICULTY_RANGE.max).required()
      .messages({ 'any.required': 'Difficulty is required' }),
  }),
};

const addBulkWords = {
  body: Joi.object({
    words: Joi.array().items(
      Joi.object({
        word: Joi.string().trim().min(2).max(50).required(),
        category: Joi.string().valid(...CATEGORIES).required(),
        difficulty: Joi.number().integer().min(DIFFICULTY_RANGE.min).max(DIFFICULTY_RANGE.max).required(),
      })
    ).min(1).max(50).required()
      .messages({ 'array.max': 'Maximum 50 words per bulk request' }),
  }),
};

module.exports = { getWords, getById, getRandom, addWord, addBulkWords };
