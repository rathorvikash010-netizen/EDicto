const asyncHandler = require('../middleware/asyncHandler');
const userWordService = require('../services/userWord.service');
const activityService = require('../services/activity.service');
const streakService = require('../services/streak.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/revision
 */
const getRevisionWords = asyncHandler(async (req, res) => {
  const words = await userWordService.getRevisionWords(req.user.id);

  ApiResponse.success(res, { data: words });
});

/**
 * POST /api/revision
 * Body: { word, partOfSpeech, definition, pronunciation, example, synonyms, antonyms }
 */
const addToRevision = asyncHandler(async (req, res) => {
  const wordData = req.body;

  if (!wordData.word) {
    throw ApiError.badRequest('Word is required');
  }

  const result = await userWordService.toggleRevision(req.user.id, wordData);

  if (!result.removed) {
    await streakService.updateStreak(req.user.id);
    await activityService.logActivity(req.user.id, 'added to revision', wordData.word);
  }

  ApiResponse.success(res, {
    message: result.removed ? 'Removed from revision' : 'Added to revision',
    data: result,
  });
});

/**
 * DELETE /api/revision/:word
 */
const removeFromRevision = asyncHandler(async (req, res) => {
  const { word } = req.params;

  const result = await userWordService.removeRevision(req.user.id, decodeURIComponent(word));

  if (!result) {
    throw ApiError.notFound('Word not found in revision');
  }

  await activityService.logActivity(req.user.id, 'removed from revision', word);

  ApiResponse.success(res, { message: 'Removed from revision' });
});

/**
 * PUT /api/revision/:word/learned
 * Mark a revision word as learned
 */
const markLearned = asyncHandler(async (req, res) => {
  const { word } = req.params;
  const UserWord = require('../models/UserWord');

  const entry = await UserWord.findOne({
    userId: req.user.id,
    word: { $regex: new RegExp(`^${decodeURIComponent(word)}$`, 'i') },
  });

  if (!entry) {
    throw ApiError.notFound('Word not found in your saved words');
  }

  entry.isLearned = true;
  await entry.save();

  await streakService.updateStreak(req.user.id);
  await activityService.logActivity(req.user.id, 'learned', decodeURIComponent(word));

  ApiResponse.success(res, {
    message: 'Word marked as learned',
    data: entry,
  });
});

/**
 * PUT /api/revision/:word/review
 * Body: { quality } — 0=again, 1=hard, 2=good, 3=easy
 * Implements simplified SM-2 spaced repetition algorithm
 */
const reviewWord = asyncHandler(async (req, res) => {
  const { word } = req.params;
  const { quality = 2 } = req.body; // default to "good"
  const UserWord = require('../models/UserWord');

  const entry = await UserWord.findOne({
    userId: req.user.id,
    word: { $regex: new RegExp(`^${decodeURIComponent(word)}$`, 'i') },
    isRevision: true,
  });

  if (!entry) {
    throw ApiError.notFound('Word not found in revision');
  }

  // SM-2 algorithm
  const q = Math.max(0, Math.min(3, quality));
  let { interval, easeFactor, reviewCount } = entry;

  if (q === 0) {
    // Again — reset
    interval = 1;
  } else if (q === 1) {
    // Hard — small increase
    interval = Math.max(1, Math.ceil(interval * 1.2));
  } else if (q === 2) {
    // Good — normal increase
    if (reviewCount === 0) interval = 1;
    else if (reviewCount === 1) interval = 3;
    else interval = Math.ceil(interval * easeFactor);
  } else {
    // Easy — large increase
    if (reviewCount === 0) interval = 4;
    else interval = Math.ceil(interval * easeFactor * 1.3);
  }

  // Adjust ease factor
  easeFactor = Math.max(1.3, easeFactor + 0.1 - (3 - q) * (0.08 + (3 - q) * 0.02));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  entry.interval = interval;
  entry.easeFactor = easeFactor;
  entry.reviewCount = reviewCount + 1;
  entry.nextReview = nextReview;
  await entry.save();

  await activityService.logActivity(req.user.id, 'reviewed', decodeURIComponent(word));

  ApiResponse.success(res, {
    message: `Review recorded. Next review in ${interval} day${interval !== 1 ? 's' : ''}`,
    data: { interval, nextReview, reviewCount: entry.reviewCount },
  });
});

module.exports = { getRevisionWords, addToRevision, removeFromRevision, markLearned, reviewWord };
