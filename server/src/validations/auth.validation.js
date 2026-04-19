const Joi = require('joi');

const register = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
      .messages({ 'any.required': 'Name is required' }),
    email: Joi.string().trim().email().required()
      .messages({ 'any.required': 'Email is required' }),
    password: Joi.string().min(6).max(128).required()
      .messages({ 'any.required': 'Password is required', 'string.min': 'Password must be at least 6 characters' }),
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().trim().email().required(),
    password: Joi.string().required(),
  }),
};

const updateProfile = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50),
    avatar: Joi.string().uri().allow(''),
  }).min(1).messages({ 'object.min': 'At least one field is required' }),
};

module.exports = { register, login, updateProfile };
