const { rateLimit } = require("express-rate-limit");

// Limit failed login attempts per IP to slow down brute-force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Demasiados intentos de inicio de sesión. Intenta más tarde.",
  },
});

// Limit account creation per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message: "Demasiadas cuentas creadas. Intenta más tarde." },
});

module.exports = { loginLimiter, registerLimiter };
