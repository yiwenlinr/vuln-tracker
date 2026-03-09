const pool = require("../db/pool");

async function getSites(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, url, owner, environment, criticality, status, created_at
       FROM sites
       ORDER BY created_at DESC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get sites error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function createSite(req, res) {
  try {
    const { name, url, owner, environment, criticality } = req.body;

    if (!name || !url) {
      return res.status(400).json({
        message: "name and url are required",
      });
    }

    const allowedEnvironments = ["prod", "dev", "staging"];
    const allowedCriticalities = ["low", "medium", "high"];

    const finalEnvironment = environment || "prod";
    const finalCriticality = criticality || "medium";

    if (!allowedEnvironments.includes(finalEnvironment)) {
      return res.status(400).json({
        message: "Invalid environment",
      });
    }

    if (!allowedCriticalities.includes(finalCriticality)) {
      return res.status(400).json({
        message: "Invalid criticality",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO sites (name, url, owner, environment, criticality)
       VALUES (?, ?, ?, ?, ?)`,
      [name, url, owner || null, finalEnvironment, finalCriticality]
    );

    return res.status(201).json({
      message: "Site created successfully",
      site: {
        id: result.insertId,
        name,
        url,
        owner: owner || null,
        environment: finalEnvironment,
        criticality: finalCriticality,
        status: "active",
      },
    });
  } catch (error) {
    console.error("Create site error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function archiveSite(req, res) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE sites
       SET status = 'archived'
       WHERE id = ? AND status = 'active'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Site not found or already archived",
      });
    }

    return res.json({
      message: "Site archived successfully",
    });
  } catch (error) {
    console.error("Archive site error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getSites,
  createSite,
  archiveSite,
};