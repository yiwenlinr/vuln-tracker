const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");

async function register(req, res) {
  try {
    // Body is validated by registerSchema; the role is never taken from the client
    const { name, email, password } = req.body;
    const role = "analyst";

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "El correo ya está registrado" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, ?)`,
      [name, email, passwordHash, role]
    );

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: result.insertId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

async function login(req, res) {
  try {
    // Body is validated by loginSchema
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
      }
    );

    return res.json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}

module.exports = { register, login };