import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

// Return the CSS badge class for a site status value
function getSiteStatusBadgeClass(status) {
  return `badge badge-${status}`;
}

export default function SitesPage() {
  const navigate = useNavigate();

  // Store the list of sites returned by the API
  const [sites, setSites] = useState([]);

  // Store user-facing error messages
  const [error, setError] = useState("");

  // Track loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Local form state for creating a new site
  const [form, setForm] = useState({
    name: "",
    url: "",
    owner: "",
    environment: "prod",
    criticality: "medium",
  });

  // Load all sites from the protected API
  async function loadSites() {
    try {
      setLoading(true);

      const response = await api.get("/sites");
      setSites(response.data);
      setError("");
    } catch (err) {
      // If authentication fails, clear session and redirect to login
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
      } else {
        setError("Could not load sites");
      }
    } finally {
      setLoading(false);
    }
  }

  // Fetch sites once when the page is mounted
  useEffect(() => {
    loadSites();
  }, []);

  // Update form state when any input changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Submit a new site to the backend
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      await api.post("/sites", form);

      // Reset form after successful creation
      setForm({
        name: "",
        url: "",
        owner: "",
        environment: "prod",
        criticality: "medium",
      });

      // Refresh the list so the new site appears immediately
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create site");
    }
  }

  // Archive a site without deleting it permanently
  async function handleArchive(id) {
    try {
      await api.patch(`/sites/${id}/archive`);
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "Could not archive site");
    }
  }

  // Clear local session data and redirect to login
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div className="page-container">
      <div className="topbar">
        <div>
          <h1>Sites</h1>
          <p className="muted">
            Manage tracked applications, portals, and internal assets
          </p>
        </div>

        <div className="topbar-actions">
          {/* Navigate back to the main dashboard */}
          <button className="secondary" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>

          {/* Navigate to the findings page */}
          <button className="secondary" onClick={() => navigate("/findings")}>
            Findings
          </button>

          {/* End the current session */}
          <button className="danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Create Site</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Customer Portal"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>URL</label>
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Owner</label>
            <input
              type="text"
              name="owner"
              value={form.owner}
              onChange={handleChange}
              placeholder="e.g. IT Team"
            />
          </div>

          <div className="grid grid-3" style={{ marginBottom: 12 }}>
            <div>
              <label>Environment</label>
              <select
                name="environment"
                value={form.environment}
                onChange={handleChange}
              >
                <option value="prod">prod</option>
                <option value="dev">dev</option>
                <option value="staging">staging</option>
              </select>
            </div>

            <div>
              <label>Criticality</label>
              <select
                name="criticality"
                value={form.criticality}
                onChange={handleChange}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
          </div>

          <button type="submit">Create Site</button>
        </form>
      </div>

      <div className="card">
        <h2 className="section-title">Site List</h2>

        {/* Show API or action-related errors */}
        {error && <p className="error-text">{error}</p>}

        {/* Show loading state before sites are available */}
        {loading && <p className="muted">Loading sites...</p>}

        {/* Show empty state if there are no sites */}
        {!loading && sites.length === 0 && (
          <p className="muted">No sites found.</p>
        )}

        {/* Render the site table when data exists */}
        {!loading && sites.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th>Owner</th>
                  <th>Environment</th>
                  <th>Criticality</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.name}</td>
                    <td>{site.url}</td>
                    <td>{site.owner || "-"}</td>
                    <td>{site.environment}</td>
                    <td>{site.criticality}</td>
                    <td>
                      <span className={getSiteStatusBadgeClass(site.status)}>
                        {site.status}
                      </span>
                    </td>
                    <td>
                      {/* Only active sites can be archived */}
                      {site.status === "active" ? (
                        <button
                          className="danger"
                          onClick={() => handleArchive(site.id)}
                        >
                          Archive
                        </button>
                      ) : (
                        <span className="muted">Archived</span>
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