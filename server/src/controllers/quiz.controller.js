const asyncHandler = require('../middleware/asyncHandler');
const quizService = require('../services/quiz.service');
const streakService = require('../services/streak.service');
const activityService = require('../services/activity.service');
const QuizResult = require('../models/QuizResult');
const ApiResponse = require('../utils/ApiResponse');
const { LIMITS } = require('../constants');
const { getTodayString } = require('../utils/dateUtils');

/**
 * POST /api/quiz/generate
 */
const generateQuiz = asyncHandler(async (req, res) => {
  const questions = await quizService.generateQuiz();

  ApiResponse.success(res, {
    message: 'Quiz generated',
    data: { questions },
  });
});

/**
 * POST /api/quiz/submit
 */
const submitQuiz = asyncHandler(async (req, res) => {
  const { score, total, answers } = req.body;
  const accuracy = Math.round((score / total) * 100);

  const result = await QuizResult.create({
    userId: req.user.id,
    score,
    total,
    accuracy,
    date: getTodayString(),
    answers,
  });

  // Prune: keep only latest MAX_QUIZ_RESULTS
  const count = await QuizResult.countDocuments({ userId: req.user.id });
  if (count > LIMITS.MAX_QUIZ_RESULTS) {
    const oldest = await QuizResult.find({ userId: req.user.id })
      .sort({ createdAt: 1 })
      .limit(count - LIMITS.MAX_QUIZ_RESULTS)
      .select('_id');
    await QuizResult.deleteMany({ _id: { $in: oldest.map((r) => r._id) } });
  }

  // Update streak and log activity
  await streakService.updateStreak(req.user.id);
  await activityService.logActivity(req.user.id, 'completed quiz', `${score}/${total}`);

  ApiResponse.created(res, {
    message: 'Quiz submitted',
    data: result,
  });
});

/**
 * GET /api/quiz/results
 */
const getQuizResults = asyncHandler(async (req, res) => {
  const results = await QuizResult.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(LIMITS.MAX_QUIZ_RESULTS)
    .lean();

  ApiResponse.success(res, { data: results });
});

/**
 * POST /api/quiz/retry — same as generate, just a semantic alias
 */
const retryQuiz = asyncHandler(async (req, res) => {
  const questions = await quizService.generateQuiz();

  ApiResponse.success(res, {
    message: 'New quiz generated',
    data: { questions },
  });
});

module.exports = { generateQuiz, submitQuiz, getQuizResults, retryQuiz };
