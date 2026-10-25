import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export default function Profile() {
  const { user, login, logout } = useAuth();
  const [form, setForm] = useState({ name: "", bio: "" });
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saved, setSaved] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMsg, setPhotoMsg] = useState(null); // { type: "ok" | "error", text }
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await api.get("/users/me");
      setForm({ name: res.data.name, bio: res.data.bio || "" });
      setAvatar(res.data.avatar || "");
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/users/me", form);
      login({ ...user, name: res.data.name }, localStorage.getItem("token"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = ""; // so the same file can be picked again later
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setPhotoMsg({ type: "error", text: "Please choose a JPG, PNG or WEBP image." });
      return;
    }
    if (file.size > MAX_SIZE) {
      setPhotoMsg({ type: "error", text: "Image must be 5 MB or smaller." });
      return;
    }

    setPhotoBusy(true);
    setPhotoMsg(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.put("/users/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatar(res.data.avatar);
      // update the saved login info so the nav bar shows the new picture right away
      login({ ...user, avatar: res.data.avatar }, localStorage.getItem("token"));
      setPhotoMsg({ type: "ok", text: "Profile picture updated!" });
    } catch (err) {
      setPhotoMsg({ type: "error", text: err.response?.data?.message || "Upload failed, please try again." });
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoBusy(true);
    setPhotoMsg(null);
    try {
      await api.delete("/users/me/avatar");
      setAvatar("");
      login({ ...user, avatar: "" }, localStorage.getItem("token"));
      setPhotoMsg({ type: "ok", text: "Profile picture removed." });
    } catch (err) {
      setPhotoMsg({ type: "error", text: err.response?.data?.message || "Could not remove picture." });
    } finally {
      setPhotoBusy(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate your account? Connected users will see that your account is deactivated, and you'll be logged out.")) {
      return;
    }
    try {
      await api.put("/users/me/deactivate");
      alert("Your account has been deactivated.");
      logout();
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deactivate account");
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "32px auto", padding: "0 16px" }}>
      <div className="ks-card" style={{ padding: 28, marginBottom: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <Avatar user={{ name: form.name, avatar }} size={96} />
          <h2 className="ks-heading" style={{ margin: "12px 0 0" }}>{form.name}</h2>
          <p style={{ color: "var(--ks-text-muted)", fontSize: 13, margin: "2px 0 12px" }}>
            {user?.email} · {user?.role}
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label
              className="ks-btn ks-btn-outline"
              style={{ cursor: photoBusy ? "wait" : "pointer", fontSize: 13, padding: "6px 14px" }}
            >
              {photoBusy ? "Please wait..." : avatar ? "Change photo" : "Add photo"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoChange}
                disabled={photoBusy}
                style={{ display: "none" }}
              />
            </label>
            {avatar && (
              <button className="ks-btn ks-btn-ghost" onClick={handleRemovePhoto} disabled={photoBusy}>
                Remove
              </button>
            )}
          </div>

          {photoMsg && (
            <p
              style={{
                fontSize: 13,
                marginTop: 10,
                color: photoMsg.type === "ok" ? "var(--ks-safe)" : "var(--ks-danger)",
              }}
            >
              {photoMsg.text}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Name</label>
          <input
            className="ks-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={{ marginBottom: 16 }}
          />

          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Bio</label>
          <textarea
            className="ks-input"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            style={{ minHeight: 80, marginBottom: 16 }}
          />

          <button type="submit" className="ks-btn" style={{ width: "100%", padding: 12 }}>
            Save Changes
          </button>
          {saved && (
            <p style={{ color: "var(--ks-safe)", fontSize: 13, textAlign: "center", marginTop: 10 }}>
              Profile updated!
            </p>
          )}
        </form>
      </div>

      <div className="ks-card" style={{ padding: 24, border: "1px solid var(--ks-danger-bg)" }}>
        <h4 className="ks-heading" style={{ margin: "0 0 6px", color: "var(--ks-danger)", fontSize: 15 }}>
          Deactivate Account
        </h4>
        <p style={{ fontSize: 13, color: "var(--ks-text-muted)", margin: "0 0 14px" }}>
          This will disable your account and log you out. Connected users will see that your account has been deactivated.
        </p>
        <button className="ks-btn ks-btn-danger" style={{ width: "100%", padding: 10 }} onClick={handleDeactivate}>
          Deactivate My Account
        </button>
      </div>
    </div>
  );
}