const Activity = require('../models/Activity');
const { LIMITS } = require('../constants');

/**
 * Log a user activity and prune to keep only the most recent entries.
 */
async function logActivity(userId, action, wordText) {
  await Activity.create({
    userId,
    action,
    word: wordText,
    timestamp: new Date(),
  });

  // Prune: keep only the latest MAX_ACTIVITIES
  const count = await Activity.countDocuments({ userId });
  if (count > LIMITS.MAX_ACTIVITIES) {
    const oldest = await Activity.find({ userId })
      .sort({ timestamp: 1 })
      .limit(count - LIMITS.MAX_ACTIVITIES)
      .select('_id');
    await Activity.deleteMany({ _id: { $in: oldest.map((a) => a._id) } });
  }
}

/**
 * Get recent activities for a user.
 */
async function getRecentActivities(userId, limit = LIMITS.MAX_ACTIVITIES) {
  return Activity.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
}

module.exports = { logActivity, getRecentActivities };
