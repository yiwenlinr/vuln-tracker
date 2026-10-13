const pool = require("../db/pool");

// Return all users (never the password hash)
async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at ASC`
    );

    return res.json(rows);
  } catch (error) {
    console.error("Get users error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

// Change a user's role. The new role applies on that user's next login,
// because the current role travels inside their JWT.
async function updateUserRole(req, res) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;

    // Prevent admins from locking themselves out
    if (id === req.user.id) {
      return res
        .status(400)
        .json({ message: "No puedes cambiar tu propio rol" });
    }

    const [result] = await pool.query(
      "UPDATE users SET role = ? WHERE id = ?",
      [role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: "Rol actualizado correctamente" });
  } catch (error) {
    console.error("Update user role error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = { getUsers, updateUserRole };
