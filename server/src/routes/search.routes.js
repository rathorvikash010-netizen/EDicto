const router = require('express').Router();
const ctrl = require('../controllers/search.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.searchWord);
router.get('/suggest', protect, ctrl.suggestWords);

module.exports = router;
