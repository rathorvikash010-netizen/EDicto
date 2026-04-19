const ApiError = require('../utils/ApiError');

/**
 * Joi validation middleware factory.
 * @param {Object} schema - Joi schema with body, params, query keys
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const key of ['body', 'params', 'query']) {
    if (schema[key]) {
      const { error, value } = schema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        errors.push(...error.details.map((d) => d.message));
      } else {
        req[key] = value; // use sanitized values
      }
    }
  }

  if (errors.length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }

  next();
};

module.exports = validate;
