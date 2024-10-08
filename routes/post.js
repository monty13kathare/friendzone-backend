const express = require("express");
const {
  createPost,
  likeAndUnlikePost,
  deletePost,
  getPostOfFollowing,
  updateCaption,
  commentOnPost,
  deleteComment,
  getAllPosts,
  updatePost,
} = require("../controllers/post");
const { getMyPosts } = require("../controllers/user");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost);

router
  .route("/post/:id")
  .get(isAuthenticated, likeAndUnlikePost)
  .put(isAuthenticated, updateCaption)
  .delete(isAuthenticated, deletePost);

router.route("/posts").get(isAuthenticated, getPostOfFollowing,getMyPosts);
router.route("/posts/all").get(isAuthenticated, getAllPosts);
router.route("/post/update/:id").put(isAuthenticated, updatePost);


router
  .route("/post/comment/:id")
  .put(isAuthenticated, commentOnPost)
  .delete(isAuthenticated, deleteComment);

module.exports = router;
