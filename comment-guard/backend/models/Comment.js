import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // post_id
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // user_id
    comment_text: { type: String, required: true, trim: true },
    classification: { type: String, enum: ["safe", "offensive"], default: "safe" },
    severity: { type: String, enum: ["none", "low", "medium", "high"], default: "none" },
    detectedWords: { type: [String], default: [] }, // array, not VARCHAR(20) — see note
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } } // matches PPT's created_at field name
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;