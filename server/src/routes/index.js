const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const leaderboardCtrl = require('../controllers/stats.controller');

// Apply rate limiter to all API routes
router.use(apiLimiter);

// ──── Route Registration ────
router.use('/auth', require('./auth.routes'));
router.use('/words', require('./word.routes'));
router.use('/daily-words', require('./dailyWord.routes'));
router.use('/search', require('./search.routes'));
router.use('/bookmarks', require('./bookmark.routes'));
router.use('/learned', require('./learned.routes'));
router.use('/revision', require('./revision.routes'));
router.use('/quiz', require('./quiz.routes'));
router.use('/streak', require('./streak.routes'));
router.use('/activities', require('./activity.routes'));
router.use('/stats', require('./stats.routes'));

// Leaderboard at top level
router.get('/leaderboard', protect, leaderboardCtrl.getLeaderboard);

module.exports = router;
