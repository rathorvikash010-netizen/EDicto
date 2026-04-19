const asyncHandler = require('../middleware/asyncHandler');
const statsService = require('../services/stats.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/stats
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getDashboardStats(req.user.id);

  ApiResponse.success(res, { data: stats });
});

/**
 * GET /api/stats/weekly
 */
const getWeeklyChart = asyncHandler(async (req, res) => {
  const data = await statsService.getWeeklyChartData(req.user.id);

  ApiResponse.success(res, { data });
});

/**
 * GET /api/leaderboard
 */
const getLeaderboard = asyncHandler(async (req, res) => {
  const leaderboard = await statsService.getLeaderboard(req.user.id);

  ApiResponse.success(res, { data: leaderboard });
});

module.exports = { getDashboardStats, getWeeklyChart, getLeaderboard };
