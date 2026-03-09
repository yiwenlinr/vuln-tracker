import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const response = await api.get("/stats");
      setStats(response.data);
      setError("");
    } catch (err) {
      setError("Could not load stats");

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <h1>Vuln Tracker Dashboard</h1>

<div style={{ display: "flex", gap: 10 }}>
  <button onClick={() => navigate("/sites")}>Sites</button>
  <button onClick={() => navigate("/findings")}>Findings</button>
  <button onClick={handleLogout}>Logout</button>
</div>


      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && !error && <p>Loading stats...</p>}

      {stats && (
        <>
          <div style={{ marginTop: 24 }}>
            <h2>Sites</h2>
            <p>Total: {stats.sites.total}</p>
            <p>Active: {stats.sites.active}</p>
            <p>Archived: {stats.sites.archived}</p>
          </div>

          <div style={{ marginTop: 24 }}>
            <h2>Findings</h2>
            <p>Total: {stats.findings.total}</p>

            <h3>By Severity</h3>
            <ul>
              {stats.findings.bySeverity.map((item) => (
                <li key={item.severity}>
                  {item.severity}: {item.total}
                </li>
              ))}
            </ul>

            <h3>By Status</h3>
            <ul>
              {stats.findings.byStatus.map((item) => (
                <li key={item.status}>
                  {item.status}: {item.total}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}