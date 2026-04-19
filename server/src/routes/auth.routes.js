const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validations/auth.validation');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, validate(schemas.register), ctrl.register);
router.post('/login', authLimiter, validate(schemas.login), ctrl.login);
router.post('/logout', protect, ctrl.logout);
router.post('/refresh', ctrl.refresh);
router.get('/me', protect, ctrl.getMe);
router.put('/profile', protect, validate(schemas.updateProfile), ctrl.updateProfile);

module.exports = router;
