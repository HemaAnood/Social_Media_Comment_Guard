import express from "express";
import fs from "fs";
import path from "path";
import User from "../models/User.js";
import protect from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/upload.js";

const router = express.Router();

// Delete an old profile picture file from the uploads folder (errors are ignored)
const removeOldFile = (relativeUrl) => {
  if (!relativeUrl || !relativeUrl.startsWith("/uploads/")) return;
  fs.unlink(path.join(process.cwd(), relativeUrl), () => {});
};

// Runs the upload and turns upload errors into a clean JSON message
const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.single("avatar")(req, res, (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;
      return res.status(400).json({ message });
    }
    next();
  });
};

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  role: user.role,
  avatar: user.avatar,
});

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

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route PUT /api/users/me/avatar - upload / change your profile picture
router.put("/me/avatar", protect, handleAvatarUpload, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findById(req.userId);
    removeOldFile(user.avatar);
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route DELETE /api/users/me/avatar - remove your profile picture
router.delete("/me/avatar", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    removeOldFile(user.avatar);
    user.avatar = "";
    await user.save();

    res.json(publicUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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
    }).select("name email avatar bio");

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