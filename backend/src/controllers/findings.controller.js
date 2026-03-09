const pool = require("../db/pool");

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
    return res.status(500).json({ message: "Internal server error" });
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
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Create a new finding linked to an existing site
async function createFinding(req, res) {
  try {
    const {
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
    } = req.body;

    // Validate required fields
    if (!site_id || !title) {
      return res.status(400).json({
        message: "site_id and title are required",
      });
    }

    // Validate allowed values
    const allowedSeverities = ["critical", "high", "medium", "low"];
    const allowedStatuses = [
      "open",
      "in_progress",
      "fixed",
      "accepted",
      "false_positive",
    ];

    const finalSeverity = severity || "low";
    const finalStatus = status || "open";

    if (!allowedSeverities.includes(finalSeverity)) {
      return res.status(400).json({ message: "Invalid severity" });
    }

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Make sure the related site exists
    const [sites] = await pool.query(
      "SELECT id FROM sites WHERE id = ?",
      [site_id]
    );

    if (sites.length === 0) {
      return res.status(404).json({ message: "Site not found" });
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
      message: "Finding created successfully",
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
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update selected fields of an existing finding
async function updateFinding(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      severity,
      status,
      owasp,
      cwe,
      cvss_score,
      description,
      evidence,
      recommendation,
    } = req.body;

    const allowedSeverities = ["critical", "high", "medium", "low"];
    const allowedStatuses = [
      "open",
      "in_progress",
      "fixed",
      "accepted",
      "false_positive",
    ];

    // Fetch the current finding before updating
    const [existing] = await pool.query(
      "SELECT * FROM findings WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: "Finding not found" });
    }

    const currentFinding = existing[0];

    const finalSeverity = severity ?? currentFinding.severity;
    const finalStatus = status ?? currentFinding.status;

    // Validate updated values
    if (!allowedSeverities.includes(finalSeverity)) {
      return res.status(400).json({ message: "Invalid severity" });
    }

    if (!allowedStatuses.includes(finalStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update only the provided fields and keep current values otherwis
    await pool.query(
      `UPDATE findings
       SET title = ?, severity = ?, status = ?, owasp = ?, cwe = ?, cvss_score = ?,
           description = ?, evidence = ?, recommendation = ?
       WHERE id = ?`,
      [
        title ?? currentFinding.title,
        finalSeverity,
        finalStatus,
        owasp ?? currentFinding.owasp,
        cwe ?? currentFinding.cwe,
        cvss_score ?? currentFinding.cvss_score,
        description ?? currentFinding.description,
        evidence ?? currentFinding.evidence,
        recommendation ?? currentFinding.recommendation,
        id,
      ]
    );

    return res.json({
      message: "Finding updated successfully",
    });
  } catch (error) {
    console.error("Update finding error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getFindings,
  getFindingsBySite,
  createFinding,
  updateFinding,
};