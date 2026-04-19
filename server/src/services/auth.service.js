const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const User = require('../models/User');
const Streak = require('../models/Streak');
const ApiError = require('../utils/ApiError');

/**
 * Hash a plaintext password.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
}

/**
 * Compare plaintext password with hashed password.
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a short-lived access token.
 */
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

/**
 * Generate a long-lived refresh token.
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id, tokenId: crypto.randomUUID() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

/**
 * Verify a refresh token and return decoded payload.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

/**
 * Hash a refresh token for storage (avoids storing raw tokens in DB).
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Register a new user.
 */
async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Create initial streak record
  await Streak.create({ userId: user._id, count: 0, lastDate: '' });

  return user;
}

/**
 * Login: validate credentials, return user + tokens.
 */
async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store hashed refresh token
  user.refreshTokens.push(hashToken(refreshToken));
  // Keep only last 5 refresh tokens (multi-device)
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }
  await user.save();

  return { user, accessToken, refreshToken };
}

/**
 * Refresh: validate refresh token, issue new tokens.
 */
async function refreshTokens(oldRefreshToken) {
  const decoded = verifyRefreshToken(oldRefreshToken);
  const user = await User.findById(decoded.userId).select('+refreshTokens');

  if (!user) {
    throw ApiError.unauthorized('User not found');
  }

  const hashedOld = hashToken(oldRefreshToken);
  const tokenIndex = user.refreshTokens.indexOf(hashedOld);

  if (tokenIndex === -1) {
    // Token reuse detected — revoke all tokens (atomic)
    await User.findByIdAndUpdate(decoded.userId, { refreshTokens: [] });
    throw ApiError.unauthorized('Token reuse detected. Please login again.');
  }

  // Rotate: remove old, add new (atomic)
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  await User.findByIdAndUpdate(decoded.userId, {
    $pull: { refreshTokens: hashedOld },
  });
  await User.findByIdAndUpdate(decoded.userId, {
    $push: { refreshTokens: { $each: [hashToken(newRefreshToken)], $slice: -5 } },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

/**
 * Logout: remove the specific refresh token.
 */
async function logoutUser(userId, refreshToken) {
  if (!refreshToken) return;

  const hashedToken = hashToken(refreshToken);
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: hashedToken },
  });
}

module.exports = {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  registerUser,
  loginUser,
  refreshTokens,
  logoutUser,
};
