import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function SitesPage() {
  const navigate = useNavigate();

  const [sites, setSites] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    url: "",
    owner: "",
    environment: "prod",
    criticality: "medium",
  });

  async function loadSites() {
    try {
      setLoading(true);
      const response = await api.get("/sites");
      setSites(response.data);
      setError("");
    } catch (err) {
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

  useEffect(() => {
    loadSites();
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
      await api.post("/sites", form);

      setForm({
        name: "",
        url: "",
        owner: "",
        environment: "prod",
        criticality: "medium",
      });

      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create site");
    }
  }

  async function handleArchive(id) {
    try {
      await api.patch(`/sites/${id}/archive`);
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "Could not archive site");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "Arial" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h1>Sites</h1>

        <div style={{ display: "flex", gap: 10 }}>
           <button onClick={() => navigate("/dashboard")}>Dashboard</button>
            <button onClick={() => navigate("/findings")}>Findings</button>
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
        <h2>Create Site</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>URL</label>
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Owner</label>
            <input
              type="text"
              name="owner"
              value={form.owner}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Environment</label>
            <select
              name="environment"
              value={form.environment}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="prod">prod</option>
              <option value="dev">dev</option>
              <option value="staging">staging</option>
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label>Criticality</label>
            <select
              name="criticality"
              value={form.criticality}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>

          <button type="submit">Create Site</button>
        </form>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <h2>Site List</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {loading && <p>Loading sites...</p>}

        {!loading && sites.length === 0 && <p>No sites found.</p>}

        {!loading && sites.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 12,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Owner</th>
                <th style={thStyle}>Environment</th>
                <th style={thStyle}>Criticality</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site) => (
                <tr key={site.id}>
                  <td style={tdStyle}>{site.name}</td>
                  <td style={tdStyle}>{site.url}</td>
                  <td style={tdStyle}>{site.owner || "-"}</td>
                  <td style={tdStyle}>{site.environment}</td>
                  <td style={tdStyle}>{site.criticality}</td>
                  <td style={tdStyle}>{site.status}</td>
                  <td style={tdStyle}>
                    {site.status === "active" ? (
                      <button onClick={() => handleArchive(site.id)}>
                        Archive
                      </button>
                    ) : (
                      <span>Archived</span>
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