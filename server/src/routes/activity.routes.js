const router = require('express').Router();
const ctrl = require('../controllers/activity.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getActivities);

module.exports = router;
