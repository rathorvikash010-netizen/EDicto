const router = require('express').Router();
const ctrl = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getDashboardStats);
router.get('/weekly', ctrl.getWeeklyChart);

module.exports = router;
