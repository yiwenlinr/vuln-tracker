import { FINDING_STATUSES, SEVERITIES } from "../utils/findings";
import { labelFor } from "../utils/i18n";

// Form fields shared by the create and edit finding forms.
// The site selector is only rendered when a list of sites is passed.
export default function FindingFormFields({ form, onChange, sites }) {
  return (
    <>
      {sites && (
        <div className="field">
          <label>Sitio</label>
          <select name="site_id" value={form.site_id} onChange={onChange}>
            <option value="">Selecciona un sitio</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="field">
        <label>Título</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={onChange}
          maxLength={180}
          placeholder="p. ej. Inyección SQL en el formulario de inicio de sesión"
        />
      </div>

      <div className="grid grid-3 field">
        <div>
          <label>Severidad</label>
          <select name="severity" value={form.severity} onChange={onChange}>
            {SEVERITIES.map((severity) => (
              <option key={severity} value={severity}>
                {labelFor(severity)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Estado</label>
          <select name="status" value={form.status} onChange={onChange}>
            {FINDING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {labelFor(status)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Puntaje CVSS</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            name="cvss_score"
            value={form.cvss_score}
            onChange={onChange}
            placeholder="p. ej. 8.7"
          />
        </div>
      </div>

      <div className="grid grid-3 field">
        <div>
          <label>OWASP</label>
          <input
            type="text"
            name="owasp"
            value={form.owasp}
            onChange={onChange}
            maxLength={10}
            placeholder="p. ej. A03"
          />
        </div>

        <div>
          <label>CWE</label>
          <input
            type="text"
            name="cwe"
            value={form.cwe}
            onChange={onChange}
            maxLength={20}
            placeholder="p. ej. CWE-89"
          />
        </div>
      </div>

      <div className="field">
        <label>Descripción</label>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows="3"
          placeholder="Describe el problema y su impacto"
        />
      </div>

      <div className="field">
        <label>Evidencia</label>
        <textarea
          name="evidence"
          value={form.evidence}
          onChange={onChange}
          rows="3"
          placeholder="Agrega la prueba de concepto, mensajes de error o resultados de pruebas"
        />
      </div>

      <div className="field">
        <label>Recomendación</label>
        <textarea
          name="recommendation"
          value={form.recommendation}
          onChange={onChange}
          rows="3"
          placeholder="Describe la corrección o mitigación"
        />
      </div>
    </>
  );
}
