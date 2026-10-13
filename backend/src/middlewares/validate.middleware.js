const { z } = require("zod");

// Zod error messages in Spanish
z.config(z.locales.es());

// User-facing names for request fields, used in the error message
const FIELD_LABELS = {
  name: "nombre",
  email: "correo",
  password: "contraseña",
  url: "URL",
  owner: "responsable",
  environment: "entorno",
  criticality: "criticidad",
  site_id: "sitio",
  siteId: "sitio",
  id: "id",
  title: "título",
  severity: "severidad",
  status: "estado",
  owasp: "OWASP",
  cwe: "CWE",
  cvss_score: "CVSS",
  description: "descripción",
  evidence: "evidencia",
  recommendation: "recomendación",
  role: "rol",
};

// Middleware factory to validate request params and body with Zod schemas
// Usage: validate({ params: idParamSchema, body: createSiteSchema })
function validate(schemas) {
  return (req, res, next) => {
    for (const key of ["params", "body"]) {
      if (!schemas[key]) continue;

      const result = schemas[key].safeParse(req[key] ?? {});

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        const field = errors[0].field;
        const label = FIELD_LABELS[field] || field || "solicitud";

        return res.status(400).json({
          message: `Campo ${label} inválido: ${errors[0].message}`,
          errors,
        });
      }

      // Replace the body with the parsed data (unknown keys stripped, defaults applied)
      if (key === "body") req.body = result.data;
    }

    next();
  };
}

module.exports = { validate };
