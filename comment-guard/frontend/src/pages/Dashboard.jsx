import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import PostCard from "../components/PostCard";
import Loading from "../components/Loading";

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      let mediaUrl = "";
      let mediaType = "none";

      if (mediaFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append("media", mediaFile);

        const uploadRes = await api.post("/posts/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        mediaUrl = uploadRes.data.mediaUrl;
        mediaType = uploadRes.data.mediaType;
        setUploading(false);
      }

      await api.post("/posts", { content: newPost, mediaUrl, mediaType });
      setNewPost("");
      setMediaFile(null);
      setMediaPreview(null);
      fetchPosts();
    } catch (err) {
      setUploading(false);
      alert(err.response?.data?.message || "Failed to create post");
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "24px auto", padding: "0 16px" }}>
      <div className="ks-card" style={{ padding: 18, marginBottom: 20 }}>
        <form onSubmit={handleCreatePost}>
          <textarea
            className="ks-input"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder={`What's on your mind, ${user?.name}?`}
            style={{ minHeight: 60, marginBottom: 10 }}
          />

          {mediaPreview && (
            <div style={{ marginBottom: 10, position: "relative" }}>
              {mediaFile?.type.startsWith("video") ? (
                <video src={mediaPreview} controls style={{ maxWidth: "100%", borderRadius: 10, maxHeight: 220 }} />
              ) : (
                <img src={mediaPreview} alt="preview" style={{ maxWidth: "100%", borderRadius: 10, maxHeight: 220, objectFit: "cover" }} />
              )}
              <button
                type="button"
                onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                className="ks-btn ks-btn-ghost"
                style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "white", borderRadius: 6 }}
              >
                Remove
              </button>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="ks-btn ks-btn-outline" style={{ cursor: "pointer", fontSize: 13 }}>
              📷 Add Photo/Video
              <input type="file" accept="image/*,video/*" onChange={handleFileChange} style={{ display: "none" }} />
            </label>
            <button type="submit" className="ks-btn" disabled={uploading}>
              {uploading ? "Uploading..." : "Post"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <Loading label="Loading posts..." />
      ) : posts.length === 0 ? (
        <div className="ks-card" style={{ padding: 24, textAlign: "center", color: "var(--ks-text-muted)" }}>
          No posts yet — be the first, or connect with others to see theirs!
        </div>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} onPostChanged={fetchPosts} />)
      )}
    </div>
  );
}