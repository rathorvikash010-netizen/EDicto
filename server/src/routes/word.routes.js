const router = require('express').Router();
const ctrl = require('../controllers/word.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validations/word.validation');

// ──── Public routes ────
// Static routes BEFORE parameterized routes
router.get('/count-by-category', ctrl.getCountByCategory);
router.get('/daily', ctrl.getDailyWord);
router.get('/random', validate(schemas.getRandom), ctrl.getRandomWords);
router.get('/', validate(schemas.getWords), ctrl.getWords);
router.get('/:id', validate(schemas.getById), ctrl.getWordById);
router.get('/:id/related', validate(schemas.getById), ctrl.getRelatedWords);

// ──── Protected routes (add/delete words) ────
router.post('/fetch-more', protect, ctrl.fetchMore);
router.post('/', protect, validate(schemas.addWord), ctrl.addWord);
router.post('/bulk', protect, validate(schemas.addBulkWords), ctrl.addBulkWords);
router.delete('/:id', protect, validate(schemas.getById), ctrl.deleteWord);

module.exports = router;
