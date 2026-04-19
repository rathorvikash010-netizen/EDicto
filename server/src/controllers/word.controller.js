const asyncHandler = require('../middleware/asyncHandler');
const Word = require('../models/Word');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getDayOfYear } = require('../utils/dateUtils');

/**
 * GET /api/words
 * Supports: ?category=GRE&difficulty=3&page=1&limit=20
 */
const getWords = asyncHandler(async (req, res) => {
  const { category, difficulty, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = Number(difficulty);

  const skip = (page - 1) * limit;
  const [words, total] = await Promise.all([
    Word.find(filter).skip(skip).limit(Number(limit)).lean(),
    Word.countDocuments(filter),
  ]);

  ApiResponse.success(res, {
    data: words,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/words/count-by-category
 */
const getCountByCategory = asyncHandler(async (req, res) => {
  const counts = await Word.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const result = { all: total };
  counts.forEach((c) => {
    result[c._id] = c.count;
  });

  ApiResponse.success(res, { data: result });
});

/**
 * GET /api/words/daily
 */
const getDailyWord = asyncHandler(async (req, res) => {
  const total = await Word.countDocuments();
  if (total === 0) throw ApiError.notFound('No words in database');

  const dayOfYear = getDayOfYear();
  const index = dayOfYear % total;

  const word = await Word.findOne().skip(index).lean();

  ApiResponse.success(res, { data: word });
});

/**
 * GET /api/words/random
 * Supports: ?exclude=<wordId>&limit=4
 */
const getRandomWords = asyncHandler(async (req, res) => {
  const { exclude, limit = 4 } = req.query;

  const match = {};
  if (exclude) {
    const mongoose = require('mongoose');
    match._id = { $ne: new mongoose.Types.ObjectId(exclude) };
  }

  const words = await Word.aggregate([
    { $match: match },
    { $sample: { size: Number(limit) } },
  ]);

  ApiResponse.success(res, { data: words });
});

/**
 * GET /api/words/:id
 */
const getWordById = asyncHandler(async (req, res) => {
  const word = await Word.findById(req.params.id).lean();
  if (!word) throw ApiError.notFound('Word not found');

  ApiResponse.success(res, { data: word });
});

/**
 * GET /api/words/:id/related
 */
const getRelatedWords = asyncHandler(async (req, res) => {
  const word = await Word.findById(req.params.id).lean();
  if (!word) throw ApiError.notFound('Word not found');

  const related = await Word.find({
    _id: { $ne: word._id },
    category: word.category,
  })
    .limit(3)
    .lean();

  ApiResponse.success(res, { data: related });
});

/**
 * POST /api/words
 * Add a new word — fetches real data from Free Dictionary API.
 * Body: { word: "ephemeral", category: "GRE", difficulty: 3 }
 */
const addWord = asyncHandler(async (req, res) => {
  const { word, category, difficulty } = req.body;

  // Check if word already exists
  const existing = await Word.findOne({ word: new RegExp(`^${word}$`, 'i') });
  if (existing) {
    throw ApiError.conflict(`Word "${word}" already exists in the database`);
  }

  // Fetch from Free Dictionary API
  const dictionaryService = require('../services/dictionary.service');
  const result = await dictionaryService.fetchWord(word, { category, difficulty });

  if (result.error) {
    throw ApiError.badRequest(result.error);
  }

  const newWord = await Word.create(result);

  ApiResponse.created(res, {
    message: `Word "${newWord.word}" added from dictionary`,
    data: newWord,
  });
});

/**
 * POST /api/words/bulk
 * Add multiple words at once — each fetched from Free Dictionary API.
 * Body: { words: [{ word: "ephemeral", category: "GRE", difficulty: 3 }, ...] }
 */
const addBulkWords = asyncHandler(async (req, res) => {
  const { words: wordList } = req.body;
  const dictionaryService = require('../services/dictionary.service');

  const results = { inserted: [], skipped: [], failed: [] };

  for (const item of wordList) {
    // Check if exists
    const existing = await Word.findOne({ word: new RegExp(`^${item.word}$`, 'i') });
    if (existing) {
      results.skipped.push(item.word);
      continue;
    }

    // Fetch from API
    const result = await dictionaryService.fetchWord(item.word, {
      category: item.category,
      difficulty: item.difficulty,
    });

    if (result.error) {
      results.failed.push({ word: item.word, reason: result.error });
      continue;
    }

    await Word.create(result);
    results.inserted.push(item.word);

    // 300ms delay between API calls
    await new Promise((r) => setTimeout(r, 300));
  }

  ApiResponse.success(res, {
    message: `Bulk add complete: ${results.inserted.length} inserted, ${results.skipped.length} skipped, ${results.failed.length} failed`,
    data: results,
  });
});

/**
 * DELETE /api/words/:id
 */
const deleteWord = asyncHandler(async (req, res) => {
  const word = await Word.findByIdAndDelete(req.params.id);
  if (!word) throw ApiError.notFound('Word not found');

  ApiResponse.success(res, { message: `Word "${word.word}" deleted` });
});

/**
 * POST /api/words/fetch-more
 * Triggers loading the next batch of 50 words from the Free Dictionary API.
 * Called when the user has seen/learned all current words.
 */
const fetchMore = asyncHandler(async (req, res) => {
  const { fetchNextBatch } = require('../services/wordPopulator.service');
  const result = await fetchNextBatch();

  ApiResponse.success(res, {
    message: result.added > 0
      ? `Loaded ${result.added} new words from the dictionary!`
      : 'All words from the curriculum have been loaded!',
    data: result,
  });
});

module.exports = {
  getWords,
  getCountByCategory,
  getDailyWord,
  getRandomWords,
  getWordById,
  getRelatedWords,
  addWord,
  addBulkWords,
  deleteWord,
  fetchMore,
};
