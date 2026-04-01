const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// @route   POST /api/posts
router.post('/', auth, upload.single('image'), postController.createPost);

// @route   GET /api/posts
router.get('/', auth, postController.getPosts);

// @route   PUT /api/posts/:id/like
router.put('/:id/like', auth, postController.likeUnlikePost);

module.exports = router;
