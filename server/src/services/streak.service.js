const Streak = require('../models/Streak');
const { getTodayString, getYesterdayString } = require('../utils/dateUtils');

/**
 * Update the user's streak.
 * - If lastDate is today: no change
 * - If lastDate is yesterday: increment
 * - Otherwise: reset to 1
 */
async function updateStreak(userId) {
  const today = getTodayString();

  let streak = await Streak.findOne({ userId });

  if (!streak) {
    streak = await Streak.create({ userId, count: 1, lastDate: today });
    return streak;
  }

  if (streak.lastDate === today) {
    return streak; // Already updated today
  }

  const yesterday = getYesterdayString();

  if (streak.lastDate === yesterday) {
    streak.count += 1;
  } else {
    streak.count = 1;
  }

  streak.lastDate = today;
  await streak.save();
  return streak;
}

/**
 * Get the user's current streak.
 * Checks if the streak is still valid (not stale).
 * If the user missed more than 1 day, the streak resets to 0.
 */
async function getStreak(userId) {
  let streak = await Streak.findOne({ userId });
  if (!streak) {
    streak = await Streak.create({ userId, count: 0, lastDate: '' });
    return streak;
  }

  // Check if streak is stale (user missed a day)
  const today = getTodayString();
  const yesterday = getYesterdayString();

  if (streak.lastDate && streak.lastDate !== today && streak.lastDate !== yesterday) {
    // Streak has gone stale — reset it
    streak.count = 0;
    await streak.save();
  }

  return streak;
}

module.exports = { updateStreak, getStreak };
