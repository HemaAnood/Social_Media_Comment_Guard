import express from "express";
import Comment from "../models/Comment.js";
import DetectionLog from "../models/DetectionLog.js";
import OffensiveWord from "../models/OffensiveWord.js";
import Report from "../models/Report.js";
import OffenseAttempt from "../models/OffenseAttempt.js";
import protect from "../middleware/auth.js";
import { analyzeComment } from "../utils/textAnalytics.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const { post, comment_text } = req.body;
    if (!post || !comment_text) {
      return res.status(400).json({ message: "post and comment_text are required" });
    }

    const { classification, severity, detectedWords } = await analyzeComment(comment_text);

    if (classification === "offensive") {
      await OffenseAttempt.create({ user: req.userId, severity, detectedWords });

      return res.status(400).json({
        message: "Your comment contains offensive content and cannot be posted.",
        classification,
        severity,
        detectedWords,
      });
    }

    const comment = await Comment.create({
      post,
      user: req.userId,
      comment_text,
      classification,
      severity,
      detectedWords,
    });

    res.status(201).json({ message: "Comment posted", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:postId", protect, async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      classification: "safe",
    })
      .populate("user", "name email")
      .sort({ created_at: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    const { classification, severity, detectedWords } = await analyzeComment(req.body.comment_text);

    if (classification === "offensive") {
      await OffenseAttempt.create({ user: req.userId, severity, detectedWords });

      return res.status(400).json({
        message: "Your edited comment contains offensive content and cannot be saved.",
        classification,
        severity,
        detectedWords,
      });
    }

    comment.comment_text = req.body.comment_text;
    comment.classification = classification;
    comment.severity = severity;
    comment.detectedWords = detectedWords;
    await comment.save();

    res.json({ message: "Comment updated", comment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/report", protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const report = await Report.create({
      comment: comment._id,
      reportedBy: req.userId,
      reason: req.body.reason || "",
    });

    res.status(201).json({ message: "Comment reported. Admin will review it.", report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;