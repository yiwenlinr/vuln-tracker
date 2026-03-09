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

export default function FindingsPage() {
  const navigate = useNavigate();

  // Store all findings returned by the backend
  const [findings, setFindings] = useState([]);

  // Store active sites to populate the site selector
  const [sites, setSites] = useState([]);

  // Store user-facing error messages
  const [error, setError] = useState("");

  // Track loading state while page data is being fetched
  const [loading, setLoading] = useState(true);

  // Local form state for creating a new finding
  const [form, setForm] = useState({
    site_id: "",
    title: "",
    severity: "low",
    status: "open",
    owasp: "",
    cwe: "",
    cvss_score: "",
    description: "",
    evidence: "",
    recommendation: "",
  });

  // Load findings and sites in parallel
  async function loadData() {
    try {
      setLoading(true);

      const [findingsRes, sitesRes] = await Promise.all([
        api.get("/findings"),
        api.get("/sites"),
      ]);

      setFindings(findingsRes.data);

      // Only active sites should be available for new findings
      setSites(sitesRes.data.filter((site) => site.status === "active"));

      setError("");
    } catch (err) {
      // If authentication fails, clear local session and redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } else {
        setError("Could not load findings");
      }
    } finally {
      setLoading(false);
    }
  }

  // Load data once when the page is mounted
  useEffect(() => {
    loadData();
  }, []);

  // Update form state when any input changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Submit a new finding to the backend
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/findings", {
        ...form,
        // Convert expected numeric fields before sending them
        site_id: Number(form.site_id),
        cvss_score: form.cvss_score === "" ? null : Number(form.cvss_score),
      });

      // Reset the form after successful creation
      setForm({
        site_id: "",
        title: "",
        severity: "low",
        status: "open",
        owasp: "",
        cwe: "",
        cvss_score: "",
        description: "",
        evidence: "",
        recommendation: "",
      });

      // Reload findings so the new entry appears immediately
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create finding");
    }
  }

  // Quick demo action to advance a finding through its workflow
  async function handleQuickUpdate(id, currentSeverity, currentStatus) {
    setError("");

    try {
      const nextStatus =
        currentStatus === "open"
          ? "in_progress"
          : currentStatus === "in_progress"
          ? "fixed"
          : currentStatus;

      await api.patch(`/findings/${id}`, {
        severity: currentSeverity,
        status: nextStatus,
      });

      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update finding");
    }
  }

  // Clear local session and go back to login
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="page-container">
      <div className="topbar">
        <div>
          <h1>Findings</h1>
          <p className="muted">
            Track security issues, remediation progress, and risk level
          </p>
        </div>

        <div className="topbar-actions">
          {/* Navigate to the main dashboard */}
          <button className="secondary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          {/* Navigate to sites management */}
          <button className="secondary" onClick={() => navigate("/sites")}>
            Sites
          </button>

          {/* End the current session */}
          <button className="danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Create Finding</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Site</label>
            <select
              name="site_id"
              value={form.site_id}
              onChange={handleChange}
            >
              <option value="">Select a site</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. SQL Injection in login form"
            />
          </div>

          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <div>
              <label>Severity</label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>

            <div>
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="fixed">fixed</option>
                <option value="accepted">accepted</option>
                <option value="false_positive">false_positive</option>
              </select>
            </div>

            <div>
              <label>CVSS Score</label>
              <input
                type="number"
                step="0.1"
                name="cvss_score"
                value={form.cvss_score}
                onChange={handleChange}
                placeholder="e.g. 8.7"
              />
            </div>
          </div>

          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <div>
              <label>OWASP</label>
              <input
                type="text"
                name="owasp"
                value={form.owasp}
                onChange={handleChange}
                placeholder="e.g. A03"
              />
            </div>

            <div>
              <label>CWE</label>
              <input
                type="text"
                name="cwe"
                value={form.cwe}
                onChange={handleChange}
                placeholder="e.g. CWE-89"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the issue and impact"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Evidence</label>
            <textarea
              name="evidence"
              value={form.evidence}
              onChange={handleChange}
              rows="3"
              placeholder="Add proof of concept, error messages, or test results"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Recommendation</label>
            <textarea
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              rows="3"
              placeholder="Describe the remediation or mitigation"
            />
          </div>

          <button type="submit">Create Finding</button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Finding List</h2>

        {/* Show API or action-related errors */}
        {error && <p className="error-text">{error}</p>}

        {/* Show loading state before findings are available */}
        {loading && <p className="muted">Loading findings...</p>}

        {/* Show empty state if there are no findings */}
        {!loading && findings.length === 0 && (
          <p className="muted">No findings found.</p>
        )}

        {/* Render findings table when data exists */}
        {!loading && findings.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>OWASP</th>
                  <th>CWE</th>
                  <th>CVSS</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {findings.map((finding) => (
                  <tr key={finding.id}>
                    <td>{finding.site_name || finding.site_id}</td>
                    <td>{finding.title}</td>
                    <td>
                      <span className={getSeverityBadgeClass(finding.severity)}>
                        {finding.severity}
                      </span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(finding.status)}>
                        {finding.status}
                      </span>
                    </td>
                    <td>{finding.owasp || "-"}</td>
                    <td>{finding.cwe || "-"}</td>
                    <td>{finding.cvss_score ?? "-"}</td>
                    <td>
                      {/* Quick workflow action for demo purposes */}
                      {finding.status !== "fixed" ? (
                        <button
                          className="secondary"
                          onClick={() =>
                            handleQuickUpdate(
                              finding.id,
                              finding.severity,
                              finding.status
                            )
                          }
                        >
                          Advance Status
                        </button>
                      ) : (
                        <span className="muted">Fixed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}