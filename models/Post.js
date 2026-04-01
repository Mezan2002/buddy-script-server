const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String, // Cloudinary URL
    default: null
  },
  images: [{
    type: String, // Array of Cloudinary URLs
  }],
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // For quick sorting and fetching without deeply populating comments just to get lengths
  commentsCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
