import mongoose from "mongoose";

const offenseAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    severity: { type: String, enum: ["low", "medium", "high"], required: true },
    detectedWords: { type: [String], default: [] },
  },
  { timestamps: true }
);

const OffenseAttempt = mongoose.model("OffenseAttempt", offenseAttemptSchema);
export default OffenseAttempt;