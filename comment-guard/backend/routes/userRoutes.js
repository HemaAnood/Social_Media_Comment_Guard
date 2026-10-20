import express from "express";
import User from "../models/User.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/me", protect, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const user = await User.findById(req.userId);

    user.name = name ?? user.name;
    user.bio = bio ?? user.bio;
    await user.save();

    res.json({ _id: user._id, name: user.name, email: user.email, bio: user.bio, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/me/deactivate — User deactivates their own account
router.put("/me/deactivate", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    user.isActive = false;
    await user.save();
    res.json({ message: "Account deactivated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/search", protect, async (req, res) => {
  try {
    const q = req.query.q || "";
    const users = await User.find({
      name: { $regex: q, $options: "i" },
      _id: { $ne: req.userId },
      isActive: true,
    }).select("name email bio");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;