const Post = require("../models/Post");
const User = require("../models/User");
const cloudinary = require("cloudinary");



exports.createPost = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "posts",
    });
    const newPostData = {
      caption: req.body.caption,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      owner: req.user._id,
      location: req.body.location,
      tags: req.body.tags,
    };

    const post = await Post.create(newPostData);

    const user = await User.findById(req.user._id);

    user.posts.unshift(post._id);

    await user.save();
    res.status(201).json({
      success: true,
      message: "Post created",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await cloudinary.v2.uploader.destroy(post.image.public_id);

    await post.remove();

    const user = await User.findById(req.user._id);

    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.likeAndUnlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.likes.includes(req.user._id)) {
      const index = post.likes.indexOf(req.user._id);

      post.likes.splice(index, 1);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Unliked",
      });
    } else {
      post.likes.push(req.user._id);

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post Liked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPostOfFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const posts = await Post.find({
      owner: {
        $in: user.following,
      },
    }).populate("owner likes comments.user");

    res.status(200).json({
      success: true,
      posts: posts.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    // Find the current user
    const user = await User.findById(req.user._id);
    // Fetch posts where the owner is either the current user or one of the users they are following
    const posts = await Post.find({
      owner: {
        $in: [...user.following, req.user._id],  // Include both the followed users and the current user
      },
    }).populate("owner likes comments.user");

    // Respond with the posts
    res.status(200).json({
      success: true,
      posts: posts.reverse(),  // Optional: Reverse the posts to show the latest first
    });
  } catch (error) {
    // Handle errors
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.updateCaption = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    post.caption = req.body.caption;
    await post.save();
    res.status(200).json({
      success: true,
      message: "Post updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    let commentIndex = -1;

    // Checking if comment already exists

    post.comments.forEach((item, index) => {
      if (item.user.toString() === req.user._id.toString()) {
        commentIndex = index;
      }
    });

    if (commentIndex !== -1) {
      post.comments[commentIndex].comment = req.body.comment;

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Comment Updated",
      });
    } else {
      post.comments.push({
        user: req.user._id,
        comment: req.body.comment,
      });

      await post.save();
      return res.status(200).json({
        success: true,
        message: "Comment added",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Checking If owner wants to delete

    if (post.owner.toString() === req.user._id.toString()) {
      if (req.body.commentId === undefined) {
        return res.status(400).json({
          success: false,
          message: "Comment Id is required",
        });
      }

      post.comments.forEach((item, index) => {
        if (item._id.toString() === req.body.commentId.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Selected Comment has deleted",
      });
    } else {
      post.comments.forEach((item, index) => {
        if (item.user.toString() === req.user._id.toString()) {
          return post.comments.splice(index, 1);
        }
      });

      await post.save();

      return res.status(200).json({
        success: true,
        message: "Your Comment has deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the logged-in user is the owner of the post
    if (post.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Update caption, tags, and location
    post.caption = req.body.caption || post.caption;
    post.tags = req.body.tags || post.tags;
    post.location = req.body.location || post.location;

    // If a new image is uploaded, replace the existing one
    if (req.body.image) {
      // Destroy the old image on Cloudinary
      await cloudinary.v2.uploader.destroy(post.image.public_id);

      // Upload the new image to Cloudinary
      const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
        folder: "posts",
      });

      // Update the image field with the new image details
      post.image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

