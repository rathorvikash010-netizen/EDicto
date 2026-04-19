const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/auth.service');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { COOKIE_OPTIONS } = require('../constants');

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  ApiResponse.created(res, {
    message: 'Registration successful',
    data: { user },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

  // Set refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  ApiResponse.success(res, {
    message: 'Login successful',
    data: {
      user,
      accessToken,
    },
  });
});

/**
 * POST /api/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await authService.logoutUser(req.user.id, refreshToken);

  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  ApiResponse.success(res, { message: 'Logged out successfully' });
});

/**
 * POST /api/auth/refresh
 */
const refresh = asyncHandler(async (req, res) => {
  const oldRefreshToken = req.cookies.refreshToken;

  if (!oldRefreshToken) {
    throw ApiError.unauthorized('Refresh token required');
  }

  const { accessToken, refreshToken } = await authService.refreshTokens(oldRefreshToken);

  res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

  ApiResponse.success(res, {
    message: 'Token refreshed',
    data: { accessToken },
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');

  ApiResponse.success(res, { data: { user } });
});

/**
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const update = {};
  if (name !== undefined) update.name = name;
  if (avatar !== undefined) update.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  });

  if (!user) throw ApiError.notFound('User not found');

  ApiResponse.success(res, {
    message: 'Profile updated',
    data: { user },
  });
});

module.exports = { register, login, logout, refresh, getMe, updateProfile };
