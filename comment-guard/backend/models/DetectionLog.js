import mongoose from "mongoose";

const detectionLogSchema = new mongoose.Schema({
  comment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", required: true }, // comment_id
  word: { type: mongoose.Schema.Types.ObjectId, ref: "OffensiveWord", required: true }, // word_id
  detected_word: { type: String, required: true },
  classification: { type: String, required: true },
  severity: { type: String, required: true },
  checked_at: { type: Date, default: Date.now },
});

const DetectionLog = mongoose.model("DetectionLog", detectionLogSchema);
export default DetectionLog;