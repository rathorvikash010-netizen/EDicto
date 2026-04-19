const router = require('express').Router();
const ctrl = require('../controllers/dailyWord.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.getDailyWords);
router.get('/all', protect, ctrl.getAllDailyWords);
router.get('/by-day', protect, ctrl.getDailyWordsByDay);
router.get('/word-of-day', protect, ctrl.getWordOfTheDay);
router.get('/count', protect, ctrl.getDailyWordCount);
router.get('/status', protect, ctrl.getFetchStatus);

module.exports = router;
