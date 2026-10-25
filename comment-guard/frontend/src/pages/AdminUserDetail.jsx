import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";
import Avatar from "../components/Avatar";

const formatDateTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [profileRes, postsRes, commentsRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get("/admin/posts"),
        api.get("/admin/comments"),
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data.filter((p) => p.author?._id === id));
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const deletePost = async (postId) => {
    if (!confirm("Delete this post and its comments? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/posts/${postId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/admin/comments/${commentId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete comment");
    }
  };

  if (loading) return <Loading label="Loading user activity..." />;
  if (!profile) return <p style={{ textAlign: "center", marginTop: 60 }}>User not found</p>;

  return (
    <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      <Link to="/admin" style={{ fontSize: 13, color: "var(--ks-primary)", textDecoration: "none", fontWeight: 600 }}>
        ← Back to Admin Panel
      </Link>

      <div className="ks-card" style={{ padding: 24, margin: "16px 0 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar user={profile} size={64} />
        <div>
          <h2 className="ks-heading" style={{ margin: 0 }}>
            {profile.name}
            {profile.isActive === false && <span style={{ color: "var(--ks-danger)", fontSize: 13, marginLeft: 10 }}>Deactivated</span>}
          </h2>
          <p style={{ color: "var(--ks-text-muted)", fontSize: 13, margin: "2px 0 0" }}>{profile.email} · {profile.role}</p>
          <p style={{ fontSize: 13, margin: "4px 0 0" }}>{profile.bio}</p>
        </div>
      </div>

      <h4 className="ks-heading" style={{ fontSize: 14, color: "var(--ks-text-muted)", marginBottom: 10 }}>
        POSTS & COMMENTS ({posts.length})
      </h4>

      {posts.length === 0 && (
        <div className="ks-card" style={{ padding: 20, textAlign: "center", color: "var(--ks-text-muted)" }}>
          This user has no posts.
        </div>
      )}

      {posts.map((p) => {
        const postComments = comments.filter((c) => c.post?._id === p._id);
        return (
          <div key={p._id} className="ks-card" style={{ padding: 16, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--ks-text-muted)" }}>{formatDateTime(p.createdAt)}</span>
              <button className="ks-btn ks-btn-ghost" style={{ color: "var(--ks-danger)" }} onClick={() => deletePost(p._id)}>
                Delete Post
              </button>
            </div>

            {p.mediaUrl && p.mediaType === "image" && (
              <img src={`http://social-media-comment-guard.onrender.com${p.mediaUrl}`} alt="" style={{ width: "100%", borderRadius: 8, marginTop: 10, maxHeight: 300, objectFit: "cover" }} />
            )}
            {p.mediaUrl && p.mediaType === "video" && (
              <video src={`http://social-media-comment-guard.onrender.com${p.mediaUrl}`} controls style={{ width: "100%", borderRadius: 8, marginTop: 10, maxHeight: 300 }} />
            )}

            <p style={{ margin: "10px 0", fontSize: 14 }}>{p.content}</p>

            {postComments.length > 0 && (
              <div style={{ borderTop: "1px solid var(--ks-border)", paddingTop: 10 }}>
                {postComments.map((c) => (
                  <div key={c._id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13 }}><strong>{c.user?.name}:</strong> {c.comment_text}</span>
                      <button className="ks-btn ks-btn-ghost" style={{ color: "var(--ks-danger)", fontSize: 11 }} onClick={() => deleteComment(c._id)}>
                        Delete
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "var(--ks-text-muted)" }}>{formatDateTime(c.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}