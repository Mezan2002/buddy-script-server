const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const { body } = require('express-validator');

router.post(
  "/",
  auth,
  upload.array("images", 5),
  [
    body('visibility', 'Visibility must be public or private').optional().isIn(['public', 'private']),
    body('content').custom((value, { req }) => {
      if (!value && (!req.files || req.files.length === 0)) {
        throw new Error('Post must contain text or an image');
      }
      return true;
    })
  ],
  postController.createPost
);

router.get("/", auth, postController.getPosts);

router.put("/:id/like", auth, postController.likeUnlikePost);

router.put(
  "/:id",
  auth,
  upload.array("images", 5),
  [
    body('visibility', 'Visibility must be public or private').optional().isIn(['public', 'private'])
  ],
  postController.updatePost
);

router.delete("/:id", auth, postController.deletePost);

module.exports = router;
