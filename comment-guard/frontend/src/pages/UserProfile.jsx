import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";

export default function UserProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const profileRes = await api.get(`/users/${id}`);
        setProfile(profileRes.data);
        const postsRes = await api.get(`/posts/user/${id}`);
        setPosts(postsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this profile");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <Loading label="Loading profile..." />;
  }

  if (!profile) {
    return <p style={{ textAlign: "center", marginTop: 60 }}>User not found</p>;
  }

  return (
    <div style={{ maxWidth: 480, margin: "32px auto", padding: "0 16px" }}>
      <div className="ks-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="ks-avatar" style={{ width: 64, height: 64, fontSize: 24 }}>
            {profile.name?.[0]?.toUpperCase()}
          </div>
          <h2 className="ks-heading" style={{ margin: "12px 0 0" }}>{profile.name}</h2>
          <p style={{ color: "var(--ks-text-muted)", fontSize: 13, margin: "2px 0 10px" }}>{profile.email}</p>
          {profile.bio && <p style={{ textAlign: "center", fontSize: 14 }}>{profile.bio}</p>}
        </div>
      </div>

      <h4 className="ks-heading" style={{ fontSize: 14, color: "var(--ks-text-muted)", marginBottom: 10 }}>
        POSTS
      </h4>

      {error && (
        <div className="ks-card" style={{ padding: 16, color: "var(--ks-text-muted)", textAlign: "center" }}>
          {error}
        </div>
      )}

      {!error && posts.length === 0 && (
        <div className="ks-card" style={{ padding: 16, color: "var(--ks-text-muted)", textAlign: "center" }}>
          No posts yet
        </div>
      )}

      {posts.map((p) => (
        <div key={p._id} className="ks-card" style={{ padding: 16, marginBottom: 10 }}>
          {p.mediaUrl && p.mediaType === "image" && (
            <img
              src={`http://social-media-comment-guard.onrender.com${p.mediaUrl}`}
              alt=""
              style={{ width: "100%", borderRadius: 10, marginBottom: 10, maxHeight: 280, objectFit: "cover" }}
            />
          )}
          {p.mediaUrl && p.mediaType === "video" && (
            <video
              src={`http://social-media-comment-guard.onrender.com${p.mediaUrl}`}
              controls
              style={{ width: "100%", borderRadius: 10, marginBottom: 10, maxHeight: 280 }}
            />
          )}
          {p.content}
        </div>
      ))}

      <Link
        to="/connections"
        style={{ display: "inline-block", marginTop: 16, color: "var(--ks-primary)", fontWeight: 600, textDecoration: "none", fontSize: 14 }}
      >
        ← Back to Connections
      </Link>
    </div>
  );
}