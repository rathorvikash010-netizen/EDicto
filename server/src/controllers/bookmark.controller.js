const asyncHandler = require('../middleware/asyncHandler');
const userWordService = require('../services/userWord.service');
const activityService = require('../services/activity.service');
const streakService = require('../services/streak.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/bookmarks
 */
const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await userWordService.getBookmarks(req.user.id);

  ApiResponse.success(res, { data: bookmarks });
});

/**
 * POST /api/bookmarks
 * Body: { word, partOfSpeech, definition, pronunciation, example, synonyms, antonyms }
 */
const addBookmark = asyncHandler(async (req, res) => {
  const wordData = req.body;

  if (!wordData.word) {
    throw ApiError.badRequest('Word is required');
  }

  const result = await userWordService.toggleBookmark(req.user.id, wordData);

  // If it was toggled ON (not removed)
  if (!result.removed) {
    await streakService.updateStreak(req.user.id);
    await activityService.logActivity(req.user.id, 'bookmarked', wordData.word);
  }

  ApiResponse.success(res, {
    message: result.removed ? 'Bookmark removed' : 'Word bookmarked',
    data: result,
  });
});

/**
 * DELETE /api/bookmarks/:word
 */
const removeBookmark = asyncHandler(async (req, res) => {
  const { word } = req.params;

  const result = await userWordService.removeBookmark(req.user.id, decodeURIComponent(word));

  if (!result) {
    throw ApiError.notFound('Bookmark not found');
  }

  await activityService.logActivity(req.user.id, 'removed bookmark', word);

  ApiResponse.success(res, { message: 'Bookmark removed' });
});

/**
 * GET /api/bookmarks/status/:word
 */
const getBookmarkStatus = asyncHandler(async (req, res) => {
  const { word } = req.params;
  const status = await userWordService.getWordStatus(req.user.id, decodeURIComponent(word));

  ApiResponse.success(res, {
    data: { isBookmarked: status.isBookmarked },
  });
});

module.exports = { getBookmarks, addBookmark, removeBookmark, getBookmarkStatus };
