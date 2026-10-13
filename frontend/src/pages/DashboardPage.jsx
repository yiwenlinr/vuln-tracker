import { useEffect, useState } from "react";
import api from "../services/api";
import Layout from "../components/Layout";
import Badge from "../components/Badge";

export default function DashboardPage() {
  // Store aggregated dashboard stats from the backend
  const [stats, setStats] = useState(null);

  // Store user-facing error messages
  const [error, setError] = useState("");

  // Track loading state while fetching stats
  const [loading, setLoading] = useState(true);

  // Fetch stats once when the page is mounted
  useEffect(() => {
    async function loadStats() {
      try {
        const response = await api.get("/stats");
        setStats(response.data);
        setError("");
      } catch {
        // Expired sessions (401) are handled by the api.js interceptor
        setError("No se pudieron cargar las estadísticas");
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  return (
    <Layout
      title="Panel de Vuln Tracker"
      subtitle="Resumen de seguridad de los activos y hallazgos registrados"
    >
      {/* Show API or session-related errors */}
      {error && <p className="error-text">{error}</p>}

      {/* Show loading state before stats are available */}
      {loading && !error && <p className="muted">Cargando estadísticas...</p>}

      {/* Render dashboard content only when stats have been loaded */}
      {stats && (
        <>
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-label">Sitios totales</div>
              <div className="stat-value">{stats.sites.total}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Sitios activos</div>
              <div className="stat-value">{stats.sites.active}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Sitios archivados</div>
              <div className="stat-value">{stats.sites.archived}</div>
            </div>
          </div>

          <div className="card" style={{ marginTop: 24 }}>
            <h2 className="section-title">Resumen de hallazgos</h2>
            <p>
              Hallazgos totales: <strong>{stats.findings.total}</strong>
            </p>
          </div>

          <div className="grid grid-3">
            <div className="card">
              <h3 className="section-title">Por severidad</h3>

              {/* Show empty state when no findings exist yet */}
              {stats.findings.bySeverity.length === 0 ? (
                <p className="muted">No hay datos disponibles.</p>
              ) : (
                <ul>
                  {stats.findings.bySeverity.map((item) => (
                    <li key={item.severity} style={{ marginBottom: 10 }}>
                      <Badge value={item.severity} /> — {item.total}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card span-2">
              <h3 className="section-title">Por estado</h3>

              {/* Show an empty state when no findings exist yet */}
              {stats.findings.byStatus.length === 0 ? (
                <p className="muted">No hay datos disponibles.</p>
              ) : (
                <ul>
                  {stats.findings.byStatus.map((item) => (
                    <li key={item.status} style={{ marginBottom: 10 }}>
                      <Badge value={item.status} /> — {item.total}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
