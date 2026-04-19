const Joi = require('joi');
const { CATEGORIES } = require('../constants');

const wordIdParam = {
  params: Joi.object({
    wordId: Joi.string().hex().length(24).required()
      .messages({ 'string.length': 'Invalid word ID format' }),
  }),
};

const getBookmarks = {
  query: Joi.object({
    category: Joi.string().valid(...CATEGORIES),
  }),
};

module.exports = { wordIdParam, getBookmarks };
