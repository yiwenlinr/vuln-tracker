const pool = require("../db/pool");

// Return aggregated dashboard stats for sites and findings
async function getStats(req, res) {
  try {
    const [[sitesTotal]] = await pool.query(
      "SELECT COUNT(*) AS total_sites FROM sites"
    );

    const [[sitesActive]] = await pool.query(
      "SELECT COUNT(*) AS active_sites FROM sites WHERE status = 'active'"
    );

    const [[sitesArchived]] = await pool.query(
      "SELECT COUNT(*) AS archived_sites FROM sites WHERE status = 'archived'"
    );

    const [[findingsTotal]] = await pool.query(
      "SELECT COUNT(*) AS total_findings FROM findings"
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
        total: sitesTotal.total_sites,
        active: sitesActive.active_sites,
        archived: sitesArchived.archived_sites,
      },
      findings: {
        total: findingsTotal.total_findings,
        bySeverity: findingsBySeverity,
        byStatus: findingsByStatus,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { getStats };