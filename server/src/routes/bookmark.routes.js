const router = require('express').Router();
const ctrl = require('../controllers/bookmark.controller');
const { protect } = require('../middleware/auth');

router.get('/', protect, ctrl.getBookmarks);
router.post('/', protect, ctrl.addBookmark);
router.get('/status/:word', protect, ctrl.getBookmarkStatus);
router.delete('/:word', protect, ctrl.removeBookmark);

module.exports = router;
