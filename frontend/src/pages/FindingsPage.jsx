import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { canEdit, getCurrentUser } from "../services/session";
import Layout from "../components/Layout";
import Badge from "../components/Badge";
import FindingDetail from "../components/FindingDetail";
import FindingFormFields from "../components/FindingFormFields";
import {
  EMPTY_FINDING_FORM,
  FINDING_STATUSES,
  NEXT_STATUS,
  SEVERITIES,
  toFindingPayload,
} from "../utils/findings";
import { labelFor } from "../utils/i18n";

const EMPTY_FILTERS = { site_id: "", severity: "", status: "" };

export default function FindingsPage() {
  const user = getCurrentUser();

  // Store all findings returned by the backend
  const [findings, setFindings] = useState([]);

  // Store all sites (archived ones are still needed for the filter)
  const [sites, setSites] = useState([]);

  // User-facing error and success messages
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Track loading state while page data is being fetched
  const [loading, setLoading] = useState(true);

  // Local form state for creating a new finding
  const [form, setForm] = useState(EMPTY_FINDING_FORM);

  // Table filters and the finding opened in the detail view
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState(null);

  // Load findings and sites in parallel
  const loadData = useCallback(async () => {
    try {
      const [findingsRes, sitesRes] = await Promise.all([
        api.get("/findings"),
        api.get("/sites"),
      ]);

      setFindings(findingsRes.data);
      setSites(sitesRes.data);
    } catch {
      // Expired sessions (401) are handled by the api.js interceptor
      setError("No se pudieron cargar los hallazgos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data once when the page is mounted
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Only active sites should be available for new findings
  const activeSites = sites.filter((site) => site.status === "active");

  const visibleFindings = findings.filter(
    (finding) =>
      (!filters.site_id || finding.site_id === Number(filters.site_id)) &&
      (!filters.severity || finding.severity === filters.severity) &&
      (!filters.status || finding.status === filters.status)
  );

  const selectedFinding = findings.find((finding) => finding.id === selectedId);

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

  function handleFilterChange(e) {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  }

  // Submit a new finding to the backend
  async function handleSubmit(e) {
    e.preventDefault();
    resetMessages();

    try {
      await api.post("/findings", toFindingPayload(form));

      // Reset the form and reload so the new entry appears immediately
      setForm(EMPTY_FINDING_FORM);
      setNotice(`Hallazgo "${form.title}" creado correctamente`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo crear el hallazgo");
    }
  }

  // Advance a finding one step through its workflow
  async function handleQuickUpdate(finding) {
    resetMessages();
    const nextStatus = NEXT_STATUS[finding.status];

    try {
      await api.patch(`/findings/${finding.id}`, { status: nextStatus });
      setNotice(`"${finding.title}" pasó a ${labelFor(nextStatus)}`);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el hallazgo");
    }
  }

  // Called by the detail view after a successful edit
  function handleSaved(message) {
    resetMessages();
    setNotice(message);
    loadData();
  }

  return (
    <Layout
      title="Hallazgos"
      subtitle="Da seguimiento a los problemas de seguridad, su remediación y su nivel de riesgo"
    >
      {/* Viewers can only read */}
      {canEdit(user) && (
        <div className="card">
          <h2 className="section-title">Crear hallazgo</h2>

          <form onSubmit={handleSubmit}>
            <FindingFormFields
              form={form}
              onChange={handleChange}
              sites={activeSites}
            />

            <button type="submit">Crear hallazgo</button>
          </form>
        </div>
      )}

      {/* Detail / edit view; keyed so it resets when the finding changes */}
      {selectedFinding && (
        <FindingDetail
          key={`${selectedFinding.id}-${selectedFinding.updated_at}`}
          finding={selectedFinding}
          canEdit={canEdit(user)}
          onClose={() => setSelectedId(null)}
          onSaved={handleSaved}
        />
      )}

      <div className="card">
        <h2 className="section-title">Lista de hallazgos</h2>

        <div className="grid grid-3 field">
          <div>
            <label>Sitio</label>
            <select
              name="site_id"
              value={filters.site_id}
              onChange={handleFilterChange}
            >
              <option value="">Todos los sitios</option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Severidad</label>
            <select
              name="severity"
              value={filters.severity}
              onChange={handleFilterChange}
            >
              <option value="">Todas las severidades</option>
              {SEVERITIES.map((severity) => (
                <option key={severity} value={severity}>
                  {labelFor(severity)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Estado</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Todos los estados</option>
              {FINDING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {labelFor(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Show API or action-related messages */}
        {error && <p className="error-text">{error}</p>}
        {notice && <p className="success-text">{notice}</p>}

        {/* Show loading state before findings are available */}
        {loading && <p className="muted">Cargando hallazgos...</p>}

        {/* Show empty state if there are no findings */}
        {!loading && findings.length === 0 && (
          <p className="muted">No hay hallazgos registrados.</p>
        )}

        {!loading && findings.length > 0 && visibleFindings.length === 0 && (
          <p className="muted">Ningún hallazgo coincide con los filtros seleccionados.</p>
        )}

        {/* Render findings table when data exists */}
        {!loading && visibleFindings.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sitio</th>
                  <th>Título</th>
                  <th>Severidad</th>
                  <th>Estado</th>
                  <th>OWASP</th>
                  <th>CWE</th>
                  <th>CVSS</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibleFindings.map((finding) => (
                  <tr key={finding.id}>
                    <td>{finding.site_name || finding.site_id}</td>
                    <td>{finding.title}</td>
                    <td>
                      <Badge value={finding.severity} />
                    </td>
                    <td>
                      <Badge value={finding.status} />
                    </td>
                    <td>{finding.owasp || "-"}</td>
                    <td>{finding.cwe || "-"}</td>
                    <td>{finding.cvss_score ?? "-"}</td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="secondary"
                          onClick={() => setSelectedId(finding.id)}
                        >
                          Ver
                        </button>

                        {/* Quick workflow action: open → in_progress → fixed */}
                        {canEdit(user) && NEXT_STATUS[finding.status] && (
                          <button
                            className="secondary"
                            onClick={() => handleQuickUpdate(finding)}
                          >
                            Avanzar estado
                          </button>
                        )}
                      </div>
                    </td>
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
