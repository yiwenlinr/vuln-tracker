const jwt = require("jsonwebtoken");

// Middleware to protect private routes using JWT
function requireAuth(req, res, next) {
  // Read the Authorization header
  const authHeader = req.headers.authorization || "";

  // Extract the token from "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

    // Reject request if no token is provided
  if (!token) return res.status(401).json({ message: "Falta el token de sesión" });

  try {
    // Verify token signature and expiration
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to the request for later use
    req.user = payload;
    next();
  } catch {
    // Reject invalid or expired tokens
    return res.status(401).json({ message: "Sesión inválida o expirada" });
  }
}

// Middleware to allow a route only for the given roles (use after requireAuth)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para realizar esta acción" });
    }

    next();
  };
}

module.exports = { requireAuth, requireRole };
