import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";

export default function Connections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [receivedRes, sentRes, connectionsRes] = await Promise.all([
        api.get("/connections/received"),
        api.get("/connections/sent"),
        api.get("/connections"),
      ]);
      setReceived(receivedRes.data);
      setSent(sentRes.data);
      setConnections(connectionsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    try {
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendRequest = async (userId) => {
    try {
      await api.post(`/connections/request/${userId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send request");
    }
  };

  const respondToRequest = async (requestId, status) => {
    try {
      await api.put(`/connections/${requestId}`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const connectionButton = (userId) => {
    if (connections.some((c) => c._id === userId)) {
      return (
        <span className="ks-btn ks-btn-outline" style={{ padding: "6px 14px", fontSize: 13, cursor: "default" }}>
          Connected
        </span>
      );
    }
    if (sent.some((r) => r.receiver._id === userId && r.status === "pending")) {
      return (
        <span className="ks-btn ks-btn-ghost" style={{ padding: "6px 14px", fontSize: 13, cursor: "default" }}>
          Pending
        </span>
      );
    }
    return (
      <button className="ks-btn" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => sendRequest(userId)}>
        Connect
      </button>
    );
  };

  const Row = ({ userId, name, email, isActive, right }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--ks-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="ks-avatar" style={{ width: 34, height: 34, fontSize: 13, opacity: isActive === false ? 0.5 : 1 }}>
          {name?.[0]?.toUpperCase()}
        </div>
        <div>
          {isActive === false ? (
            <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ks-text-muted)" }}>{name}</div>
          ) : userId ? (
            <Link to={`/profile/${userId}`} style={{ fontWeight: 600, fontSize: 14, color: "var(--ks-text)", textDecoration: "none" }}>
              {name}
            </Link>
          ) : (
            <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
          )}
          {isActive === false ? (
            <div style={{ fontSize: 12, color: "var(--ks-danger)" }}>This account has been deactivated</div>
          ) : (
            email && <div style={{ fontSize: 12, color: "var(--ks-text-muted)" }}>{email}</div>
          )}
        </div>
      </div>
      {isActive === false ? null : right}
    </div>
  );

  if (loading) {
    return <Loading label="Loading connections..." />;
  }

  return (
    <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
      <h2 className="ks-heading" style={{ marginBottom: 20 }}>Connections</h2>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          className="ks-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people by name..."
        />
        <button type="submit" className="ks-btn">Search</button>
      </form>

      {searchResults.length > 0 && (
        <div className="ks-card" style={{ padding: 16, marginBottom: 24 }}>
          <h4 className="ks-heading" style={{ marginTop: 0, fontSize: 14, color: "var(--ks-text-muted)" }}>SEARCH RESULTS</h4>
          {searchResults.map((u) => (
            <Row key={u._id} userId={u._id} name={u.name} email={u.email} right={connectionButton(u._id)} />
          ))}
        </div>
      )}

      <div className="ks-card" style={{ padding: 16, marginBottom: 24 }}>
        <h4 className="ks-heading" style={{ marginTop: 0, fontSize: 14, color: "var(--ks-text-muted)" }}>
          RECEIVED REQUESTS ({received.length})
        </h4>
        {received.length === 0 && <p style={{ color: "var(--ks-text-muted)", fontSize: 14 }}>No pending requests</p>}
        {received.map((r) => (
          <Row
            key={r._id}
            userId={r.sender._id}
            name={r.sender.name}
            isActive={r.sender.isActive}
            right={
              <div style={{ display: "flex", gap: 6 }}>
                <button className="ks-btn" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => respondToRequest(r._id, "accepted")}>Accept</button>
                <button className="ks-btn ks-btn-outline" style={{ padding: "6px 12px", fontSize: 13 }} onClick={() => respondToRequest(r._id, "rejected")}>Reject</button>
              </div>
            }
          />
        ))}
      </div>

      <div className="ks-card" style={{ padding: 16, marginBottom: 24 }}>
        <h4 className="ks-heading" style={{ marginTop: 0, fontSize: 14, color: "var(--ks-text-muted)" }}>
          SENT REQUESTS ({sent.length})
        </h4>
        {sent.length === 0 && <p style={{ color: "var(--ks-text-muted)", fontSize: 14 }}>No sent requests</p>}
        {sent.map((r) => (
          <Row key={r._id} userId={r.receiver._id} name={r.receiver.name} isActive={r.receiver.isActive} right={<em style={{ fontSize: 13, color: "var(--ks-text-muted)" }}>{r.status}</em>} />
        ))}
      </div>

      <div className="ks-card" style={{ padding: 16 }}>
        <h4 className="ks-heading" style={{ marginTop: 0, fontSize: 14, color: "var(--ks-text-muted)" }}>
          YOUR CONNECTIONS ({connections.length})
        </h4>
        {connections.length === 0 && <p style={{ color: "var(--ks-text-muted)", fontSize: 14 }}>No connections yet</p>}
        {connections.map((u) => (
          <Row key={u._id} userId={u._id} name={u.name} email={u.email} isActive={u.isActive} />
        ))}
      </div>
    </div>
  );
}