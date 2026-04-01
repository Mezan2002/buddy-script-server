const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const auth = require("../middleware/auth");

router.post("/:postId", auth, commentController.addComment);

router.get("/:postId", auth, commentController.getComments);

router.put("/:id/like", auth, commentController.likeUnlikeComment);

module.exports = router;
