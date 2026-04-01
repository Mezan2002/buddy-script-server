const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   POST /api/posts
router.post('/', auth, upload.array('images', 5), postController.createPost);

// @route   GET /api/posts
router.get('/', auth, postController.getPosts);

// @route   PUT /api/posts/:id/like
router.put('/:id/like', auth, postController.likeUnlikePost);

// @route   PUT /api/posts/:id
router.put('/:id', auth, upload.array('images', 5), postController.updatePost);

// @route   DELETE /api/posts/:id
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
