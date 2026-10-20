import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", form);
      login(res.data, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(160deg, #6C5CE7 0%, #8E7CF0 40%, #FF7AB6 100%)",
        padding: 20,
      }}
    >
      <div className="ks-card" style={{ width: "100%", maxWidth: 380, padding: 32 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <Logo size={56} />
          <h2 className="ks-heading" style={{ margin: "12px 0 2px", color: "var(--ks-text)" }}>
            KindSphere
          </h2>
          <p style={{ color: "var(--ks-text-muted)", fontSize: 13, margin: 0 }}>
            Comment safely. Connect kindly.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="ks-input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ marginBottom: 12 }}
          />
          <input
            className="ks-input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ marginBottom: 16 }}
          />
          {error && (
            <p style={{ color: "var(--ks-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>
          )}
          <button type="submit" className="ks-btn" style={{ width: "100%", padding: 12 }}>
            Log In
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--ks-text-muted)", marginTop: 20 }}>
          No account?{" "}
          <Link to="/register" style={{ color: "var(--ks-primary)", fontWeight: 600, textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}