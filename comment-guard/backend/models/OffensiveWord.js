import mongoose from "mongoose";

const offensiveWordSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true, lowercase: true, trim: true },
  severity: { type: String, enum: ["low", "medium", "high"], required: true },
  category: { type: String, default: "general" },
  description: { type: String, default: "" },
});

const OffensiveWord = mongoose.model("OffensiveWord", offensiveWordSchema);
export default OffensiveWord;