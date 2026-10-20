import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Loading from "../components/Loading";

const formatDateTime = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function Admin() {
  const [tab, setTab] = useState("offenders");
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [offenders, setOffenders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [usersRes, reportsRes, offendersRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/reports"),
        api.get("/admin/top-offenders"),
      ]);
      setUsers(usersRes.data);
      setReports(reportsRes.data);
      setOffenders(offendersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resolveReport = async (reportId) => {
    if (!confirm("Delete this reported comment?")) return;
    try {
      await api.delete(`/admin/reports/${reportId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const TabButton = ({ tabKey, label }) => (
    <button
      onClick={() => setTab(tabKey)}
      className="ks-btn"
      style={{
        background: tab === tabKey ? "var(--ks-primary)" : "var(--ks-border)",
        color: tab === tabKey ? "white" : "var(--ks-text)",
        padding: "8px 16px",
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      {label}
    </button>
  );

  const severityBadge = (count, color, label) =>
    count > 0 && (
      <span style={{ fontSize: 11, background: color, color: "white", borderRadius: 6, padding: "2px 7px", marginRight: 5 }}>
        {label}: {count}
      </span>
    );

  if (loading) {
    return <Loading label="Loading admin data..." />;
  }

  return (
    <div style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px" }}>
      <h2 className="ks-heading" style={{ marginBottom: 20 }}>Admin Panel</h2>

      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap" }}>
        <TabButton tabKey="offenders" label={`Top Offenders (${offenders.length})`} />
        <TabButton tabKey="reports" label={`Reports (${reports.length})`} />
        <TabButton tabKey="users" label={`Users (${users.length})`} />
      </div>

      {tab === "offenders" && (
        <div>
          {offenders.length === 0 && (
            <div className="ks-card" style={{ padding: 20, textAlign: "center", color: "var(--ks-text-muted)" }}>
              No offensive comment attempts recorded yet
            </div>
          )}
          {offenders.map((o, i) => (
            <div key={o._id} className="ks-card" style={{ padding: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "#ED4956" : i < 3 ? "#FF7AB6" : "var(--ks-border)",
                  color: i < 3 ? "white" : "var(--ks-text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13,
                }}
              >
                {i + 1}
              </div>
              <div className="ks-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                {o.user.name?.[0]?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{o.user.name}</div>
                <div style={{ fontSize: 12, color: "var(--ks-text-muted)" }}>{o.user.email}</div>
                <div style={{ marginTop: 6 }}>
                  {severityBadge(o.highSeverity, "#ED4956", "High")}
                  {severityBadge(o.mediumSeverity, "#FF9F43", "Med")}
                  {severityBadge(o.lowSeverity, "#8E8E93", "Low")}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="ks-heading" style={{ fontSize: 22, fontWeight: 700, color: "var(--ks-danger)" }}>
                  {o.totalAttempts}
                </div>
                <div style={{ fontSize: 11, color: "var(--ks-text-muted)" }}>attempts</div>
                {o.lastAttempt && (
                  <div style={{ fontSize: 10, color: "var(--ks-text-muted)", marginTop: 2 }}>
                    last: {formatDateTime(o.lastAttempt)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div>
          {reports.length === 0 && (
            <div className="ks-card" style={{ padding: 20, textAlign: "center", color: "var(--ks-text-muted)" }}>
              No pending reports
            </div>
          )}
          {reports.map((r) => (
            <div key={r._id} className="ks-card" style={{ padding: 16, marginBottom: 12, borderLeft: "4px solid var(--ks-danger)" }}>
              <p style={{ margin: "0 0 6px", fontWeight: 600 }}>{r.comment?.user?.name}</p>
              <p style={{ fontStyle: "italic", margin: "0 0 8px", color: "var(--ks-text)" }}>
                "{r.comment?.comment_text}"
              </p>
              <p style={{ fontSize: 13, color: "var(--ks-text-muted)", margin: "0 0 10px" }}>
                Reported by <strong>{r.reportedBy?.name}</strong>
                {r.reason && <> — "{r.reason}"</>} · {formatDateTime(r.createdAt)}
              </p>
              <button className="ks-btn ks-btn-danger" style={{ padding: "6px 14px", fontSize: 13 }} onClick={() => resolveReport(r._id)}>
                Delete Comment
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "users" && (
        <div className="ks-card" style={{ padding: 8 }}>
          {users.map((u) => (
            <Link
              key={u._id}
              to={`/admin/users/${u._id}`}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderBottom: "1px solid var(--ks-border)", textDecoration: "none", color: "inherit" }}
            >
              <div className="ks-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{u.name?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ks-primary)" }}>
                  {u.name} <em style={{ color: "var(--ks-text-muted)", fontWeight: 400 }}>({u.role})</em>
                  {u.isActive === false && <span style={{ color: "var(--ks-danger)", fontSize: 12, marginLeft: 8 }}>Deactivated</span>}
                </div>
                <div style={{ fontSize: 12, color: "var(--ks-text-muted)" }}>{u.email}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}