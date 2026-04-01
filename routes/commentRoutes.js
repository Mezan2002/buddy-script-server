const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// @route   POST /api/comments/:postId
// @desc    Add a comment to a post (or reply if parentCommentId is in body)
router.post('/:postId', auth, commentController.addComment);

// @route   GET /api/comments/:postId
router.get('/:postId', auth, commentController.getComments);

// @route   PUT /api/comments/:id/like
router.put('/:id/like', auth, commentController.likeUnlikeComment);

module.exports = router;
