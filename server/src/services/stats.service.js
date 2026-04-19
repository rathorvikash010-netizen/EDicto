const LearnedWord = require('../models/LearnedWord');
const UserWord = require('../models/UserWord');
const QuizResult = require('../models/QuizResult');
const Activity = require('../models/Activity');
const Streak = require('../models/Streak');
const User = require('../models/User');
const { getWeekStartUTC } = require('../utils/dateUtils');

/**
 * Get aggregated dashboard stats for a user.
 */
async function getDashboardStats(userId) {
  const [
    learnedWordCount,
    userWordLearnedCount,
    wordsSaved,
    streak,
    quizResults,
    revisionCount,
  ] = await Promise.all([
    LearnedWord.countDocuments({ userId }),
    UserWord.countDocuments({ userId, isLearned: true }),
    UserWord.countDocuments({ userId, isBookmarked: true }),
    Streak.findOne({ userId }).lean(),
    QuizResult.find({ userId }).lean(),
    UserWord.countDocuments({ userId, isRevision: true }),
  ]);

  const totalWordsLearned = learnedWordCount + userWordLearnedCount;

  const quizzesTaken = quizResults.length;
  const quizAccuracy = quizzesTaken > 0
    ? Math.round(quizResults.reduce((sum, r) => sum + r.accuracy, 0) / quizzesTaken)
    : 0;
  const totalQuizScore = quizResults.reduce((sum, r) => sum + r.score, 0);
  const revisionsDone = revisionCount;
  const dailyStreak = streak ? streak.count : 0;

  return {
    totalWordsLearned,
    wordsSaved,
    dailyStreak,
    quizAccuracy,
    revisionsDone,
    quizzesTaken,
    totalQuizScore,
  };
}

/**
 * Get weekly progress chart data (Sun–Sat).
 */
async function getWeeklyChartData(userId) {
  const weekStart = getWeekStartUTC();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize data
  const data = dayNames.map((name) => ({ name, words: 0, quizzes: 0 }));

  // Get activities from this week
  const activities = await Activity.find({
    userId,
    timestamp: { $gte: weekStart },
  }).lean();

  const wordActions = ['learned', 'bookmarked', 'added to revision', 'reviewed'];

  activities.forEach((a) => {
    // Use IST for day calculation so activities near midnight map to correct day
    const istTime = new Date(new Date(a.timestamp).getTime() + 5.5 * 60 * 60 * 1000);
    const dayIndex = istTime.getUTCDay();
    if (wordActions.includes(a.action)) {
      data[dayIndex].words++;
    }
    if (a.action === 'completed quiz') {
      data[dayIndex].quizzes++;
    }
  });

  return data;
}

/**
 * Get leaderboard — real users ranked by score.
 * Score = (totalQuizScore × 10) + (totalWordsLearned × 5)
 */
async function getLeaderboard(currentUserId, limit = 10) {
  const users = await User.find().select('name email').lean();

  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const [quizResults, learnedCount] = await Promise.all([
        QuizResult.find({ userId: user._id }).lean(),
        LearnedWord.countDocuments({ userId: user._id }),
      ]);

      const totalQuizScore = quizResults.reduce((sum, r) => sum + r.score, 0);
      const score = totalQuizScore * 10 + learnedCount * 5;

      return {
        userId: user._id,
        name: user.name,
        score,
        isCurrentUser: user._id.toString() === currentUserId.toString(),
      };
    })
  );

  // Sort descending by score
  leaderboard.sort((a, b) => b.score - a.score);

  return leaderboard.slice(0, limit);
}

module.exports = { getDashboardStats, getWeeklyChartData, getLeaderboard };
