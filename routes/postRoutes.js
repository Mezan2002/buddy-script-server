const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const auth = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

router.post("/", auth, upload.array("images", 5), postController.createPost);

router.get("/", auth, postController.getPosts);

router.put("/:id/like", auth, postController.likeUnlikePost);

router.put("/:id", auth, upload.array("images", 5), postController.updatePost);

router.delete("/:id", auth, postController.deletePost);

module.exports = router;
