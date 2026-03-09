import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function FindingsPage() {
  const navigate = useNavigate();

  const [findings, setFindings] = useState([]);
  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

  async function loadData() {
    try {
      setLoading(true);

      const [findingsRes, sitesRes] = await Promise.all([
        api.get("/findings"),
        api.get("/sites"),
      ]);

      setFindings(findingsRes.data);
      setSites(sitesRes.data.filter((site) => site.status === "active"));
      setError("");
    } catch (err) {
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

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/findings", {
        ...form,
        site_id: Number(form.site_id),
        cvss_score: form.cvss_score === "" ? null : Number(form.cvss_score),
      });

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

      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create finding");
    }
  }

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

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Findings</h1>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/sites")}>Sites</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 10,
          marginBottom: 24,
        }}
      >
        <h2>Create Finding</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Site</label>
            <select
              name="site_id"
              value={form.site_id}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
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
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Severity</label>
              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="critical">critical</option>
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label>Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              >
                <option value="open">open</option>
                <option value="in_progress">in_progress</option>
                <option value="fixed">fixed</option>
                <option value="accepted">accepted</option>
                <option value="false_positive">false_positive</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label>OWASP</label>
              <input
                type="text"
                name="owasp"
                value={form.owasp}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>CWE</label>
              <input
                type="text"
                name="cwe"
                value={form.cwe}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label>CVSS Score</label>
              <input
                type="number"
                step="0.1"
                name="cvss_score"
                value={form.cvss_score}
                onChange={handleChange}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
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
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Evidence</label>
            <textarea
              name="evidence"
              value={form.evidence}
              onChange={handleChange}
              rows="3"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Recommendation</label>
            <textarea
              name="recommendation"
              value={form.recommendation}
              onChange={handleChange}
              rows="3"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <button type="submit">Create Finding</button>
        </form>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <h2>Finding List</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Loading findings...</p>}

        {!loading && findings.length === 0 && <p>No findings found.</p>}

        {!loading && findings.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Site</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Severity</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>OWASP</th>
                <th style={thStyle}>CWE</th>
                <th style={thStyle}>CVSS</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((finding) => (
                <tr key={finding.id}>
                  <td style={tdStyle}>{finding.site_name || finding.site_id}</td>
                  <td style={tdStyle}>{finding.title}</td>
                  <td style={tdStyle}>{finding.severity}</td>
                  <td style={tdStyle}>{finding.status}</td>
                  <td style={tdStyle}>{finding.owasp || "-"}</td>
                  <td style={tdStyle}>{finding.cwe || "-"}</td>
                  <td style={tdStyle}>{finding.cvss_score ?? "-"}</td>
                  <td style={tdStyle}>
                    {finding.status !== "fixed" ? (
                      <button
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
                      <span>Fixed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "10px",
};

const tdStyle = {
  borderBottom: "1px solid #eee",
  padding: "10px",
};