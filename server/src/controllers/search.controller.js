const asyncHandler = require('../middleware/asyncHandler');
const searchService = require('../services/search.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/search?q=ephemeral
 */
const searchWord = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    throw ApiError.badRequest('Search query is required');
  }

  const result = await searchService.searchWord(q.trim());

  if (result.error) {
    throw ApiError.notFound(result.error);
  }

  ApiResponse.success(res, {
    data: result,
  });
});

module.exports = { searchWord };
