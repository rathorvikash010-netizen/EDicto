const router = require('express').Router();
const ctrl = require('../controllers/revision.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.getRevisionWords);
router.post('/', protect, ctrl.addToRevision);
router.put('/:word/learned', protect, ctrl.markLearned);
router.put('/:word/review', protect, ctrl.reviewWord);
router.delete('/:word', protect, ctrl.removeFromRevision);

module.exports = router;
