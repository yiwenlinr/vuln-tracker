const jwt = require("jsonwebtoken");

/**
 * Auth middleware (JWT).
 * - Expects: Authorization: Bearer <token>
 * - On success: attaches decoded payload to req.user
 * - On failure: returns 401
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, email }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

module.exports = { requireAuth };