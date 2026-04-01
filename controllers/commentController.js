const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.addComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const postId = req.params.postId;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = new Comment({
      author: req.user.id,
      post: postId,
      content,
      isReply: !!parentCommentId,
      parentComment: parentCommentId || null
    });

    const comment = await newComment.save();
    
    // Update post comment count
    post.commentsCount += 1;
    await post.save();

    await comment.populate('author', 'firstName lastName _id');

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId })
      .populate('author', 'firstName lastName _id')
      .sort({ createdAt: 1 }); // Oldest first for comments usually

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.likeUnlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user.id;
    const index = comment.likes.indexOf(userId);

    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }

    await comment.save();
    res.json(comment.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
