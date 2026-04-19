const asyncHandler = require('../middleware/asyncHandler');
const LearnedWord = require('../models/LearnedWord');
const Word = require('../models/Word');
const streakService = require('../services/streak.service');
const activityService = require('../services/activity.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/learned
 */
const getLearnedWords = asyncHandler(async (req, res) => {
  const entries = await LearnedWord.find({ userId: req.user.id })
    .populate('wordId')
    .sort({ learnedAt: -1 })
    .lean();

  const words = entries.filter((e) => e.wordId).map((e) => ({
    ...e.wordId,
    learnedAt: e.learnedAt,
  }));

  ApiResponse.success(res, { data: words });
});

/**
 * GET /api/learned/:wordId/status
 */
const getLearnedStatus = asyncHandler(async (req, res) => {
  const entry = await LearnedWord.findOne({
    userId: req.user.id,
    wordId: req.params.wordId,
  });

  ApiResponse.success(res, {
    data: { isLearned: !!entry },
  });
});

/**
 * POST /api/learned/:wordId
 * Idempotent: marking an already-learned word is a no-op.
 */
const markLearned = asyncHandler(async (req, res) => {
  const { wordId } = req.params;

  // Verify word exists
  const word = await Word.findById(wordId);
  if (!word) throw ApiError.notFound('Word not found');

  // Check if already learned
  const existing = await LearnedWord.findOne({ userId: req.user.id, wordId });
  if (existing) {
    return ApiResponse.success(res, { message: 'Already learned', data: { word } });
  }

  await LearnedWord.create({ userId: req.user.id, wordId });

  // Update streak and log activity
  await streakService.updateStreak(req.user.id);
  await activityService.logActivity(req.user.id, 'learned', word.word);

  ApiResponse.created(res, {
    message: 'Word marked as learned',
    data: { word },
  });
});

module.exports = { getLearnedWords, getLearnedStatus, markLearned };
