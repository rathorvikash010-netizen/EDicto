const router = require('express').Router();
const ctrl = require('../controllers/streak.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getStreak);

module.exports = router;
