const Post = require("../models/Post");
const Comment = require("../models/Comment");

exports.createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    let imageUrl = null;
    let imagesUrls = [];

    if (req.files && req.files.length > 0) {
      imagesUrls = req.files.map((file) => file.path);
      imageUrl = imagesUrls[0]; // fallback for legacy clients
    } else if (req.file) {
      imageUrl = req.file.path;
      imagesUrls = [imageUrl];
    }

    if (!content && imagesUrls.length === 0) {
      return res
        .status(400)
        .json({ message: "Post must contain text or an image" });
    }

    // Validate visibility
    const finalVisibility = ["public", "private"].includes(visibility) ? visibility : "public";

    const newPost = new Post({
      author: req.user.id,
      content: content || "",
      image: imageUrl,
      images: imagesUrls,
      visibility: finalVisibility,
    });

    const post = await newPost.save();

    await post.populate("author", "firstName lastName _id");

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const userId = req.user ? req.user.id : null;

    const query = {
      $or: [
        { visibility: "public" },
        ...(userId ? [{ visibility: "private", author: userId }] : []),
      ],
    };

    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    const posts = await Post.find(query)
      .populate("author", "firstName lastName _id avatar")
      .populate("likes", "firstName lastName _id avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.likeUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
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
    await post.populate("likes", "firstName lastName _id avatar");
    res.json(post.likes);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized to edit this post" });
    }

    const { content, visibility, removeExistingImages } = req.body;
    
    if (content !== undefined) post.content = content;
    if (visibility !== undefined && ["public", "private"].includes(visibility)) {
      post.visibility = visibility;
    }

    if (removeExistingImages === 'true') {
      post.images = [];
      post.image = null;
    }

    if (req.files && req.files.length > 0) {
      const newImagesUrls = req.files.map((file) => file.path);
      post.images = [...post.images, ...newImagesUrls];
      post.image = post.images[0]; 
    } else if (req.file) {
      post.images = [...post.images, req.file.path];
      post.image = post.images[0];
    }

    await post.save();
    await post.populate("author", "firstName lastName _id avatar");

    res.json(post);
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ message: "User not authorized to delete this post" });
    }

    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.json({ message: "Post removed" });
  } catch (err) {
    console.error(err);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).send("Server Error");
  }
};
