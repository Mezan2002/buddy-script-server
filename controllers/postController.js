const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = req.file.path; // URL from Cloudinary
    }

    if (!content && !imageUrl) {
      return res.status(400).json({ message: 'Post must contain text or an image' });
    }

    const newPost = new Post({
      author: req.user.id,
      content: content || '',
      image: imageUrl,
      visibility: visibility || 'public'
    });

    const post = await newPost.save();
    
    // Populate author before returning
    await post.populate('author', 'firstName lastName _id');

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get all public posts, OR private posts authored by the logged-in user
    const query = {
      $or: [
        { visibility: 'public' },
        { visibility: 'private', author: req.user.id }
      ]
    };

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find(query)
      .populate('author', 'firstName lastName _id')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user.id;
    const index = post.likes.indexOf(userId);

    if (index === -1) {
      // Like
      post.likes.push(userId);
    } else {
      // Unlike
      post.likes.splice(index, 1);
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};
