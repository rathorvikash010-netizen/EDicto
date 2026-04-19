const router = require('express').Router();
const ctrl = require('../controllers/learned.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { wordIdParam } = require('../validations/bookmark.validation');

router.use(protect);

router.get('/', ctrl.getLearnedWords);
router.get('/:wordId/status', validate(wordIdParam), ctrl.getLearnedStatus);
router.post('/:wordId', validate(wordIdParam), ctrl.markLearned);

module.exports = router;
