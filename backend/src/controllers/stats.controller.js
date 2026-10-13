const pool = require("../db/pool");

// Return aggregated dashboard stats for sites and findings
async function getStats(req, res) {
  try {
    // Site and finding totals in a single round trip
    const [[totals]] = await pool.query(
      `SELECT
        COUNT(*) AS total_sites,
        COALESCE(SUM(status = 'active'), 0) AS active_sites,
        COALESCE(SUM(status = 'archived'), 0) AS archived_sites,
        (SELECT COUNT(*) FROM findings) AS total_findings
      FROM sites`
    );

    const [findingsBySeverity] = await pool.query(
      `SELECT severity, COUNT(*) AS total
       FROM findings
       GROUP BY severity
       ORDER BY FIELD(severity, 'critical', 'high', 'medium', 'low')`
    );

    const [findingsByStatus] = await pool.query(
      `SELECT status, COUNT(*) AS total
       FROM findings
       GROUP BY status
       ORDER BY total DESC`
    );

    return res.json({
      sites: {
        total: totals.total_sites,
        active: Number(totals.active_sites),
        archived: Number(totals.archived_sites),
      },
      findings: {
        total: totals.total_findings,
        bySeverity: findingsBySeverity,
        byStatus: findingsByStatus,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = { getStats };