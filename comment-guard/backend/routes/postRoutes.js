import express from "express";
import Post from "../models/Post.js";
import ConnectionRequest from "../models/ConnectionRequest.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/upload", protect, upload.single("media"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const mediaType = req.file.mimetype.startsWith("video") ? "video" : "image";
  const mediaUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ mediaUrl, mediaType });
});

router.post("/", protect, async (req, res) => {
  try {
    const { content, mediaUrl, mediaType } = req.body;
    if (!content) return res.status(400).json({ message: "Post content is required" });

    const post = await Post.create({
      author: req.userId,
      content,
      mediaUrl: mediaUrl || "",
      mediaType: mediaType || "none",
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    });

    const connectedIds = connections.map((c) =>
      c.sender.toString() === req.userId ? c.receiver : c.sender
    );
    const visibleAuthorIds = [...connectedIds, req.userId];

    const posts = await Post.find({ author: { $in: visibleAuthorIds } })
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/user/:userId", protect, async (req, res) => {
  try {
    const targetId = req.params.userId;

    if (targetId !== req.userId) {
      const isConnected = await ConnectionRequest.findOne({
        status: "accepted",
        $or: [
          { sender: req.userId, receiver: targetId },
          { sender: targetId, receiver: req.userId },
        ],
      });
      if (!isConnected) {
        return res.status(403).json({ message: "You must be connected to view this user's posts" });
      }
    }

    const posts = await Post.find({ author: targetId }).populate("author", "name email").sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const alreadyLiked = post.likes.some((id) => id.toString() === req.userId);
    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to edit this post" });
    }

    post.content = req.body.content ?? post.content;
    post.mediaUrl = req.body.mediaUrl ?? post.mediaUrl;
    post.mediaType = req.body.mediaType ?? post.mediaType;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;