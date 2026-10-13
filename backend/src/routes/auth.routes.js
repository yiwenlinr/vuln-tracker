const express = require("express");
const router = express.Router();

// Import auth controller handlers
const { register, login } = require("../controllers/auth.controller");

// Import JWT protection middleware
const { requireAuth } = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const {
  loginLimiter,
  registerLimiter,
} = require("../middlewares/rateLimit.middleware");
const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validators");

router.post(
  "/register",
  registerLimiter,
  validate({ body: registerSchema }),
  register
);

// Authenticate a user and return a JWT
router.post("/login", loginLimiter, validate({ body: loginSchema }), login);

// Return the authenticated user's token payload
router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Sesión válida",
    user: req.user,
  });
});

module.exports = router;
