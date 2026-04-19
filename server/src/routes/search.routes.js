const router = require('express').Router();
const ctrl = require('../controllers/search.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.searchWord);

module.exports = router;
