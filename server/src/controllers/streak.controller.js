const asyncHandler = require('../middleware/asyncHandler');
const streakService = require('../services/streak.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/streak
 */
const getStreak = asyncHandler(async (req, res) => {
  const streak = await streakService.getStreak(req.user.id);

  ApiResponse.success(res, {
    data: {
      count: streak.count,
      lastDate: streak.lastDate,
    },
  });
});

module.exports = { getStreak };
