import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { canEdit, getCurrentUser, isAdmin } from "../services/session";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import { labelFor } from "../utils/i18n";

const EMPTY_SITE_FORM = {
  name: "",
  url: "",
  owner: "",
  environment: "prod",
  criticality: "medium",
};

const ENVIRONMENTS = ["prod", "staging", "dev"];
const CRITICALITIES = ["low", "medium", "high"];

export default function SitesPage() {
  const user = getCurrentUser();

  // Store the list of sites returned by the API
  const [sites, setSites] = useState([]);

  // User-facing error and success messages
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Track loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Local form state for creating a new site
  const [form, setForm] = useState(EMPTY_SITE_FORM);

  // Load all sites from the protected API
  const loadSites = useCallback(async () => {
    try {
      const response = await api.get("/sites");
      setSites(response.data);
    } catch {
      // Expired sessions (401) are handled by the api.js interceptor
      setError("No se pudieron cargar los sitios");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch sites once when the page is mounted
  useEffect(() => {
    loadSites();
  }, [loadSites]);

  // Clear old messages before a new action
  function resetMessages() {
    setError("");
    setNotice("");
  }

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
    resetMessages();

    try {
      await api.post("/sites", form);

      // Reset form and refresh the list so the new site appears immediately
      setForm(EMPTY_SITE_FORM);
      setNotice(`Sitio "${form.name}" creado correctamente`);
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el sitio");
    }
  }

  // Archive a site (after confirmation) without deleting it permanently
  async function handleArchive(site) {
    const confirmed = window.confirm(
      `¿Archivar el sitio "${site.name}"? No se le podrán agregar hallazgos hasta que se restaure.`
    );
    if (!confirmed) return;

    resetMessages();

    try {
      await api.patch(`/sites/${site.id}/archive`);
      setNotice(`Sitio "${site.name}" archivado`);
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo archivar el sitio");
    }
  }

  // Bring an archived site back to active
  async function handleRestore(site) {
    resetMessages();

    try {
      await api.patch(`/sites/${site.id}/restore`);
      setNotice(`Sitio "${site.name}" restaurado`);
      loadSites();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo restaurar el sitio");
    }
  }

  return (
    <Layout
      title="Sitios"
      subtitle="Gestiona aplicaciones, portales y activos internos"
    >
      {/* Viewers can only read */}
      {canEdit(user) && (
        <div className="card">
          <h2 className="section-title">Crear sitio</h2>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={120}
                placeholder="p. ej. Portal de clientes"
              />
            </div>

            <div className="field">
              <label>URL</label>
              <input
                type="url"
                name="url"
                value={form.url}
                onChange={handleChange}
                maxLength={255}
                placeholder="https://ejemplo.com"
              />
            </div>

            <div className="field">
              <label>Responsable</label>
              <input
                type="text"
                name="owner"
                value={form.owner}
                onChange={handleChange}
                maxLength={120}
                placeholder="p. ej. Equipo de TI"
              />
            </div>

            <div className="grid grid-3 field">
              <div>
                <label>Entorno</label>
                <select
                  name="environment"
                  value={form.environment}
                  onChange={handleChange}
                >
                  {ENVIRONMENTS.map((environment) => (
                    <option key={environment} value={environment}>
                      {labelFor(environment)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Criticidad</label>
                <select
                  name="criticality"
                  value={form.criticality}
                  onChange={handleChange}
                >
                  {CRITICALITIES.map((criticality) => (
                    <option key={criticality} value={criticality}>
                      {labelFor(criticality)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit">Crear sitio</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2 className="section-title">Lista de sitios</h2>

        {/* Show API or action-related messages */}
        {error && <p className="error-text">{error}</p>}
        {notice && <p className="success-text">{notice}</p>}

        {/* Show loading state before sites are available */}
        {loading && <p className="muted">Cargando sitios...</p>}

        {/* Show empty state if there are no sites */}
        {!loading && sites.length === 0 && (
          <p className="muted">No hay sitios registrados.</p>
        )}

        {/* Render the site table when data exists */}
        {!loading && sites.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>URL</th>
                  <th>Responsable</th>
                  <th>Entorno</th>
                  <th>Criticidad</th>
                  <th>Estado</th>
                  {isAdmin(user) && <th>Acciones</th>}
                </tr>
              </thead>

              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>{site.name}</td>
                    <td>{site.url}</td>
                    <td>{site.owner || "-"}</td>
                    <td>{labelFor(site.environment)}</td>
                    <td>{labelFor(site.criticality)}</td>
                    <td>
                      <Badge value={site.status} />
                    </td>
                    {/* Only admins can archive and restore */}
                    {isAdmin(user) && (
                      <td>
                        {site.status === "active" ? (
                          <button
                            className="danger"
                            onClick={() => handleArchive(site)}
                          >
                            Archivar
                          </button>
                        ) : (
                          <button
                            className="secondary"
                            onClick={() => handleRestore(site)}
                          >
                            Restaurar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
