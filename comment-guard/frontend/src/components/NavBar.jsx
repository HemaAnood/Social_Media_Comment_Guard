import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Avatar from "./Avatar";

export default function NavBar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const linkStyle = (path) => ({
    textDecoration: "none",
    color: location.pathname === path ? "var(--ks-primary)" : "var(--ks-text-muted)",
    fontWeight: location.pathname === path ? 600 : 500,
    fontSize: 14,
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "12px 24px",
        background: "white",
        borderBottom: "1px solid var(--ks-border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Logo size={28} />
        <span className="ks-heading" style={{ fontWeight: 700, fontSize: 18 }}>KindSphere</span>
      </div>

      <div style={{ display: "flex", gap: 20, marginLeft: 12 }}>
        <Link to="/dashboard" style={linkStyle("/dashboard")}>Dashboard</Link>
        <Link to="/connections" style={linkStyle("/connections")}>Connections</Link>
        <Link to="/profile" style={linkStyle("/profile")}>Profile</Link>
        {user.role === "admin" && <Link to="/admin" style={linkStyle("/admin")}>Admin</Link>}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <Link to="/profile" title="Edit your profile picture">
          <Avatar user={user} size={32} />
        </Link>
        <button className="ks-btn ks-btn-outline" onClick={logout} style={{ padding: "6px 14px", fontSize: 13 }}>
          Logout
        </button>
      </div>
    </div>
  );
}