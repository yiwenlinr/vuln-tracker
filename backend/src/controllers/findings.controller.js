const pool = require("../db/pool");

// Columns that PATCH /findings/:id is allowed to change
const UPDATABLE_FIELDS = [
  "title",
  "severity",
  "status",
  "owasp",
  "cwe",
  "cvss_score",
  "description",
  "evidence",
  "recommendation",
];

// Return all findings with their related site name
async function getFindings(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT
        f.id,
        f.site_id,
        s.name AS site_name,
        f.title,
        f.severity,
        f.status,
        f.owasp,
        f.cwe,
        f.cvss_score,
        f.description,
        f.evidence,
        f.recommendation,
        f.created_at,
        f.updated_at
      FROM findings f
      INNER JOIN sites s ON f.site_id = s.id
      ORDER BY f.created_at DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get findings error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Return findings for a single site
async function getFindingsBySite(req, res) {
  try {
    const { siteId } = req.params;

    const [rows] = await pool.query(
      `SELECT
        id,
        site_id,
        title,
        severity,
        status,
        owasp,
        cwe,
        cvss_score,
        description,
        evidence,
        recommendation,
        created_at,
        updated_at
      FROM findings
      WHERE site_id = ?
      ORDER BY created_at DESC`,
      [siteId]
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get findings by site error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Create a new finding linked to an existing site
async function createFinding(req, res) {
  try {
    // Body is validated by createFindingSchema (defaults already applied)
    const {
      site_id,
      title,
      severity: finalSeverity,
      status: finalStatus,
      owasp,
      cwe,
      cvss_score,
      description,
      evidence,
      recommendation,
    } = req.body;

    // Make sure the related site exists and is still active
    const [sites] = await pool.query(
      "SELECT id, status FROM sites WHERE id = ?",
      [site_id]
    );

    if (sites.length === 0) {
      return res.status(404).json({ message: "Sitio no encontrado" });
    }

    if (sites[0].status !== "active") {
      return res.status(400).json({
        message: "No se pueden agregar hallazgos a un sitio archivado",
      });
    }

    // Insert the finding
    const [result] = await pool.query(
      `INSERT INTO findings
      (site_id, title, severity, status, owasp, cwe, cvss_score, description, evidence, recommendation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        site_id,
        title,
        finalSeverity,
        finalStatus,
        owasp || null,
        cwe || null,
        cvss_score ?? null,
        description || null,
        evidence || null,
        recommendation || null,
      ]
    );

    return res.status(201).json({
      message: "Hallazgo creado correctamente",
      finding: {
        id: result.insertId,
        site_id,
        title,
        severity: finalSeverity,
        status: finalStatus,
        owasp: owasp || null,
        cwe: cwe || null,
        cvss_score: cvss_score ?? null,
        description: description || null,
        evidence: evidence || null,
        recommendation: recommendation || null,
      },
    });
  } catch (error) {
    console.error("Create finding error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Update selected fields of an existing finding
async function updateFinding(req, res) {
  try {
    const { id } = req.params;

    // Body is validated by updateFindingSchema. Only the keys actually sent are
    // updated, so sending null clears a field while omitting it keeps it.
    const fields = UPDATABLE_FIELDS.filter((field) =>
      Object.hasOwn(req.body, field)
    );

    if (fields.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    // Column names come from the UPDATABLE_FIELDS whitelist, values are parameterized
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) =>
      req.body[field] === "" ? null : req.body[field]
    );

    const [result] = await pool.query(
      `UPDATE findings SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Hallazgo no encontrado" });
    }

    return res.json({
      message: "Hallazgo actualizado correctamente",
    });
  } catch (error) {
    console.error("Update finding error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = {
  getFindings,
  getFindingsBySite,
  createFinding,
  updateFinding,
};