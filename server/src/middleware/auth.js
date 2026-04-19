const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

/**
 * JWT authentication middleware.
 * Extracts token from Authorization: Bearer <token> header.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    return next(ApiError.unauthorized('Invalid or expired access token'));
  }
};

/**
 * Role-based access control middleware.
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient permissions'));
  }
  next();
};

module.exports = { protect, authorize };
