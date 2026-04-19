const router = require('express').Router();
const ctrl = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../validations/quiz.validation');

router.use(protect);

router.post('/generate', ctrl.generateQuiz);
router.post('/submit', validate(schemas.submitQuiz), ctrl.submitQuiz);
router.get('/results', ctrl.getQuizResults);
router.post('/retry', ctrl.retryQuiz);

module.exports = router;
