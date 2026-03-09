import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Return the CSS badge class for a finding severity value
function getSeverityBadgeClass(severity) {
  return `badge badge-${severity}`;
}

// Return the CSS badge class for a finding status value
function getStatusBadgeClass(status) {
  return `badge badge-${status}`;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Store aggregated dashboard stats from the backend
  const [stats, setStats] = useState(null);

  // Store user-facing error messages
  const [error, setError] = useState("");

  // Track loading state while fetching stats
  const [loading, setLoading] = useState(true);

  // Load dashboard stats from the protected API endpoint
  async function loadStats() {
    try {
      const response = await api.get("/stats");
      setStats(response.data);
      setError("");
    } catch (err) {
      setError("Could not load stats");

      // If the session is no longer valid, clear local data and redirect
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }

  // Fetch stats once when the page is mounted
  useEffect(() => {
    loadStats();
  }, []);

  // Clear the current session and go back to login
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="page-container">
      <div className="topbar">
        <div>
          <h1>Vuln Tracker Dashboard</h1>
          <p className="muted">
            Security overview for tracked assets and findings
          </p>
        </div>

        <div className="topbar-actions">
          {/* Navigate to the sites management page */}
          <button className="secondary" onClick={() => navigate("/sites")}>
            Sites
          </button>

          {/* Navigate to the findings management page */}
          <button className="secondary" onClick={() => navigate("/findings")}>
            Findings
          </button>

          {/* End the current session */}
          <button className="danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Show API or session-related errors */}
      {error && <p className="error-text">{error}</p>}

      {/* Show loading state before stats are available */}
      {loading && !error && <p className="muted">Loading stats...</p>}

      {/* Render dashboard content only when stats have been loaded */}
      {stats && (
        <>
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-label">Total Sites</div>
              <div className="stat-value">{stats.sites.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Active Sites</div>
              <div className="stat-value">{stats.sites.active}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Archived Sites</div>
              <div className="stat-value">{stats.sites.archived}</div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Findings Summary</h2>
            <p>
              Total Findings: <strong>{stats.findings.total}</strong>
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card">
              <h3 className="section-title">By Severity</h3>

              {/* Show empty state when no findings exist yet */}
              {stats.findings.bySeverity.length === 0 ? (
                <p className="muted">No data available.</p>
              ) : (
                <ul>
                  {stats.findings.bySeverity.map((item) => (
                    <li key={item.severity} style={{ marginBottom: 10 }}>
                      <span className={getSeverityBadgeClass(item.severity)}>
                        {item.severity}
                      </span>{" "}
                      — {item.total}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card" style={{ gridColumn: "span 2" }}>
              <h3 className="section-title">By Status</h3>

              {/* Show a empty state when no findings exist yet */}
              {stats.findings.byStatus.length === 0 ? (
                <p className="muted">No data available.</p>
              ) : (
                <ul>
                  {stats.findings.byStatus.map((item) => (
                    <li key={item.status} style={{ marginBottom: 10 }}>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>{" "}
                      — {item.total}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}