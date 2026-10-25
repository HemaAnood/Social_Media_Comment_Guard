import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const formatDateTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function PostCard({ post, onPostChanged }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [editingPost, setEditingPost] = useState(false);
  const [postDraft, setPostDraft] = useState(post.content);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [likes, setLikes] = useState(post.likes || []);

  const isMyPost = post.author?._id === user?._id;
  const isLiked = likes.some((id) => id === user?._id || id?._id === user?._id);

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${post._id}`);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handleLike = async () => {
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Like failed:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to like post");
    }
  };

  const handleSavePostEdit = async () => {
    try {
      await api.put(`/posts/${post._id}`, { content: postDraft });
      post.content = postDraft;
      setEditingPost(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update post");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      await api.delete(`/posts/${post._id}`);
      onPostChanged?.();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const res = await api.post("/comments", { post: post._id, comment_text: text });
      setFeedback({ type: "safe", message: res.data.message });
      fetchComments();
      setText("");
    } catch (err) {
      const data = err.response?.data;
      setFeedback({
        type: "offensive",
        message: data?.message || "Something went wrong, please try again",
        severity: data?.severity,
        detectedWords: data?.detectedWords,
      });
    }
  };

  const handleSaveCommentEdit = async (commentId) => {
    try {
      await api.put(`/comments/${commentId}`, { comment_text: commentDraft });
      setEditingCommentId(null);
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const handleReport = async (commentId) => {
    const reason = prompt("Why are you reporting this comment? (optional)") || "";
    try {
      await api.post(`/comments/${commentId}/report`, { reason });
      alert("Comment reported. Admin will review it.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to report comment");
    }
  };

  return (
    <div className="ks-card" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="ks-avatar">{post.author?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="ks-heading" style={{ fontWeight: 600, margin: 0 }}>{post.author?.name}</p>
            <span style={{ fontSize: 11, color: "var(--ks-text-muted)" }}>{formatDateTime(post.createdAt)}</span>
          </div>
        </div>
        {isMyPost && !editingPost && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ks-btn ks-btn-ghost" onClick={() => setEditingPost(true)}>Edit</button>
            <button className="ks-btn ks-btn-ghost" style={{ color: "var(--ks-danger)" }} onClick={handleDeletePost}>Delete</button>
          </div>
        )}
      </div>

      {post.mediaUrl && post.mediaType === "image" && (
        <img
          src={`http://social-media-comment-guard.onrender.com${post.mediaUrl}`}
          alt="post media"
          style={{ width: "100%", borderRadius: 10, marginTop: 10, maxHeight: 320, objectFit: "cover" }}
        />
      )}

      {post.mediaUrl && post.mediaType === "video" && (
        <video
          src={`http://social-media-comment-guard.onrender.com${post.mediaUrl}`}
          controls
          style={{ width: "100%", borderRadius: 10, marginTop: 10, maxHeight: 320 }}
        />
      )}

      {editingPost ? (
        <div style={{ margin: "12px 0" }}>
          <textarea className="ks-input" value={postDraft} onChange={(e) => setPostDraft(e.target.value)} style={{ minHeight: 60 }} />
          <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
            <button className="ks-btn" onClick={handleSavePostEdit}>Save</button>
            <button className="ks-btn ks-btn-outline" onClick={() => { setEditingPost(false); setPostDraft(post.content); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <p style={{ margin: "12px 0" }}>{post.content}</p>
      )}

      <div style={{ marginBottom: 10 }}>
        <button
          onClick={handleLike}
          className="ks-btn ks-btn-ghost"
          style={{ color: isLiked ? "#ED4956" : "var(--ks-text-muted)", fontSize: 16, padding: "4px 10px" }}
        >
          {isLiked ? "♥" : "♡"} {likes.length > 0 ? likes.length : ""}
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--ks-border)", paddingTop: 10 }}>
        {comments.map((c) => {
          const isMyComment = c.user?._id === user?._id;
          return (
            <div key={c._id} style={{ fontSize: 14, marginBottom: 8 }}>
              {editingCommentId === c._id ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <input className="ks-input" value={commentDraft} onChange={(e) => setCommentDraft(e.target.value)} />
                  <button className="ks-btn" onClick={() => handleSaveCommentEdit(c._id)}>Save</button>
                  <button className="ks-btn ks-btn-outline" onClick={() => setEditingCommentId(null)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>
                    <strong>{c.user?.name}</strong> {c.comment_text}
                    <span style={{ fontSize: 10, color: "var(--ks-text-muted)", marginLeft: 6 }}>{formatDateTime(c.created_at)}</span>
                  </span>
                  {isMyComment ? (
                    <span style={{ display: "flex", gap: 8 }}>
                      <button className="ks-btn ks-btn-ghost" onClick={() => { setEditingCommentId(c._id); setCommentDraft(c.comment_text); }}>Edit</button>
                      <button className="ks-btn ks-btn-ghost" style={{ color: "var(--ks-danger)" }} onClick={() => handleDeleteComment(c._id)}>Delete</button>
                    </span>
                  ) : isMyPost ? (
                    <button className="ks-btn ks-btn-ghost" onClick={() => handleReport(c._id)}>Report</button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddComment} style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <input className="ks-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment..." />
        <button type="submit" className="ks-btn">Post</button>
      </form>

      {feedback && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 10,
            fontSize: 13,
            background: feedback.type === "offensive" ? "var(--ks-danger-bg)" : "var(--ks-safe-bg)",
            color: feedback.type === "offensive" ? "var(--ks-danger)" : "var(--ks-safe)",
          }}
        >
          {feedback.message}
          {feedback.type === "offensive" && feedback.detectedWords && (
            <div>Severity: <strong>{feedback.severity}</strong> · Detected: {feedback.detectedWords.join(", ")}</div>
          )}
        </div>
      )}
    </div>
  );
}