const asyncHandler = require('../middleware/asyncHandler');
const activityService = require('../services/activity.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * GET /api/activities
 */
const getActivities = asyncHandler(async (req, res) => {
  const activities = await activityService.getRecentActivities(req.user.id);

  ApiResponse.success(res, { data: activities });
});

module.exports = { getActivities };
