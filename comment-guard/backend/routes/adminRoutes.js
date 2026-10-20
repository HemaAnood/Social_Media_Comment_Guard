import express from "express";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import ConnectionRequest from "../models/ConnectionRequest.js";
import Report from "../models/Report.js";
import OffenseAttempt from "../models/OffenseAttempt.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

router.use(protect, adminOnly);

// @route GET /api/admin/users — View Users
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// @route GET /api/admin/connections — View Connection Requests
router.get("/connections", async (req, res) => {
  const connections = await ConnectionRequest.find()
    .populate("sender", "name email")
    .populate("receiver", "name email");
  res.json(connections);
});

// @route GET /api/admin/posts — View ALL Posts, from every user
router.get("/posts", async (req, res) => {
  const posts = await Post.find().populate("author", "name email").sort({ createdAt: -1 });
  res.json(posts);
});

// @route DELETE /api/admin/posts/:id — Admin can delete any post directly
router.delete("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });

  await post.deleteOne();
  res.json({ message: "Post deleted" });
});

// @route GET /api/admin/comments — View ALL Comments, from every user, on every post
router.get("/comments", async (req, res) => {
  const comments = await Comment.find()
    .populate("user", "name email")
    .populate({ path: "post", populate: { path: "author", select: "name email" } })
    .sort({ created_at: -1 });
  res.json(comments);
});

// @route DELETE /api/admin/comments/:id — Admin can delete any comment directly
router.delete("/comments/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  await comment.deleteOne();
  res.json({ message: "Comment deleted" });
});

// @route GET /api/admin/reports — View reported comments
router.get("/reports", async (req, res) => {
  const reports = await Report.find({ status: "pending" })
    .populate("reportedBy", "name email")
    .populate({
      path: "comment",
      populate: [{ path: "user", select: "name email" }, { path: "post" }],
    });
  res.json(reports);
});

// @route DELETE /api/admin/reports/:id — Delete the reported comment, resolve the report
router.delete("/reports/:id", async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ message: "Report not found" });

  await Comment.findByIdAndDelete(report.comment);
  report.status = "resolved";
  await report.save();

  res.json({ message: "Comment deleted, report resolved" });
});

// @route GET /api/admin/top-offenders — Users with the most offensive comment attempts
router.get("/top-offenders", async (req, res) => {
  const results = await OffenseAttempt.aggregate([
    {
      $group: {
        _id: "$user",
        totalAttempts: { $sum: 1 },
        highSeverity: { $sum: { $cond: [{ $eq: ["$severity", "high"] }, 1, 0] } },
        mediumSeverity: { $sum: { $cond: [{ $eq: ["$severity", "medium"] }, 1, 0] } },
        lowSeverity: { $sum: { $cond: [{ $eq: ["$severity", "low"] }, 1, 0] } },
        lastAttempt: { $max: "$createdAt" },
      },
    },
    { $sort: { totalAttempts: -1 } },
    { $limit: 20 },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    {
      $project: {
        totalAttempts: 1, highSeverity: 1, mediumSeverity: 1, lowSeverity: 1, lastAttempt: 1,
        "user.name": 1, "user.email": 1,
      },
    },
  ]);

  res.json(results);
});

export default router;