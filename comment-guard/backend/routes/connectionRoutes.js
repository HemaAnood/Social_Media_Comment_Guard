import express from "express";
import ConnectionRequest from "../models/ConnectionRequest.js";
import protect from "../middleware/auth.js";

const router = express.Router();

router.post("/request/:receiverId", protect, async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (receiverId === req.userId) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const existing = await ConnectionRequest.findOne({
      $or: [
        { sender: req.userId, receiver: receiverId },
        { sender: receiverId, receiver: req.userId },
      ],
      status: { $in: ["pending", "accepted"] },
    });
    if (existing) {
      const msg = existing.status === "accepted" ? "You are already connected" : "Request already pending";
      return res.status(400).json({ message: msg });
    }

    const request = await ConnectionRequest.create({ sender: req.userId, receiver: receiverId });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/sent", protect, async (req, res) => {
  try {
    const sent = await ConnectionRequest.find({ sender: req.userId }).populate("receiver", "name email isActive");
    res.json(sent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/received", protect, async (req, res) => {
  try {
    const received = await ConnectionRequest.find({ receiver: req.userId, status: "pending" }).populate(
      "sender",
      "name email isActive"
    );
    res.json(received);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "status must be 'accepted' or 'rejected'" });
    }

    const request = await ConnectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.receiver.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized to respond to this request" });
    }

    request.status = status;
    request.respondedAt = new Date();
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    })
      .populate("sender", "name email isActive")
      .populate("receiver", "name email isActive");

    const connectedUsers = connections.map((c) =>
      c.sender._id.toString() === req.userId ? c.receiver : c.sender
    );

    res.json(connectedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;