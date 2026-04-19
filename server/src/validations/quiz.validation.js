const Joi = require('joi');

const submitQuiz = {
  body: Joi.object({
    score: Joi.number().integer().min(0).required(),
    total: Joi.number().integer().min(1).required(),
    answers: Joi.array().items(Joi.boolean()).required(),
  }),
};

module.exports = { submitQuiz };
