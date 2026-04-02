const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        type: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Indexes for performance at scale
postSchema.index({ visibility: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
