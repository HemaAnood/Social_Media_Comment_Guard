import mongoose from "mongoose";

const connectionRequestSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // senderId
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // receiverId
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date, default: null },
});

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);
export default ConnectionRequest;