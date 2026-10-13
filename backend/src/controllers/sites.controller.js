const pool = require("../db/pool");

// Return all sites ordered by newest first
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
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Create a new site record
async function createSite(req, res) {
  try {
    // Body is validated by createSiteSchema (defaults already applied)
    const {
      name,
      url,
      owner,
      environment: finalEnvironment,
      criticality: finalCriticality,
    } = req.body;

    // Insert the site into the database
    const [result] = await pool.query(
      `INSERT INTO sites (name, url, owner, environment, criticality)
       VALUES (?, ?, ?, ?, ?)`,
      [name, url, owner || null, finalEnvironment, finalCriticality]
    );

    return res.status(201).json({
      message: "Sitio creado correctamente",
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
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Move a site from one status to another (used by archive and restore)
async function changeSiteStatus(req, res, { from, to, notFound, success }) {
  try {
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE sites SET status = ? WHERE id = ? AND status = ?",
      [to, id, from]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: notFound });
    }

    return res.json({ message: success });
  } catch (error) {
    console.error(`Change site status (${to}) error:`, error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Soft-archive a site instead of deleting it
function archiveSite(req, res) {
  return changeSiteStatus(req, res, {
    from: "active",
    to: "archived",
    notFound: "Sitio no encontrado o ya archivado",
    success: "Sitio archivado correctamente",
  });
}

// Bring an archived site back to active
function restoreSite(req, res) {
  return changeSiteStatus(req, res, {
    from: "archived",
    to: "active",
    notFound: "Sitio no encontrado o ya activo",
    success: "Sitio restaurado correctamente",
  });
}

module.exports = {
  getSites,
  createSite,
  archiveSite,
  restoreSite,
};
