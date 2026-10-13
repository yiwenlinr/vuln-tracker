import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { findingToForm, toFindingPayload } from "../utils/findings";
import { formatDate } from "../utils/i18n";
import Badge from "./Badge";
import FindingFormFields from "./FindingFormFields";

// Read-only text block that keeps line breaks (evidence often has them)
function TextBlock({ label, value }) {
  return (
    <div className="field">
      <div className="stat-label">{label}</div>
      <div className="pre-wrap">{value || <span className="muted">-</span>}</div>
    </div>
  );
}

// Show every field of a finding, with an edit mode for admins and analysts
export default function FindingDetail({ finding, canEdit, onClose, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => findingToForm(finding));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const cardRef = useRef(null);

  // Bring the detail card into view when it opens
  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleCancel() {
    setForm(findingToForm(finding));
    setError("");
    setEditing(false);
  }

  // Send the whole form; the backend only updates the keys it receives
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await api.patch(`/findings/${finding.id}`, toFindingPayload(form));
      setEditing(false);
      onSaved("Hallazgo actualizado correctamente");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el hallazgo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card" ref={cardRef}>
      <div className="topbar">
        <h2 className="section-title">
          #{finding.id} · {finding.title}
        </h2>

        <div className="topbar-actions">
          {canEdit && !editing && (
            <button onClick={() => setEditing(true)}>Editar</button>
          )}
          <button className="secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      {editing ? (
        <form onSubmit={handleSubmit}>
          <FindingFormFields form={form} onChange={handleChange} />

          <div className="topbar-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="secondary" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-3 field">
            <div>
              <div className="stat-label">Sitio</div>
              {finding.site_name}
            </div>
            <div>
              <div className="stat-label">Severidad / Estado</div>
              <Badge value={finding.severity} /> <Badge value={finding.status} />
            </div>
            <div>
              <div className="stat-label">OWASP / CWE / CVSS</div>
              {finding.owasp || "-"} / {finding.cwe || "-"} /{" "}
              {finding.cvss_score ?? "-"}
            </div>
          </div>

          <TextBlock label="Descripción" value={finding.description} />
          <TextBlock label="Evidencia" value={finding.evidence} />
          <TextBlock label="Recomendación" value={finding.recommendation} />

          <p className="muted">
            Creado el {formatDate(finding.created_at)} · Actualizado el{" "}
            {formatDate(finding.updated_at)}
          </p>
        </>
      )}
    </div>
  );
}
