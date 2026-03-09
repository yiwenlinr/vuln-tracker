const express = require("express");
const router = express.Router();

// Import auth controller handlers
const { register, login } = require("../controllers/auth.controller");

// Import JWT protection middleware
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", register);

// Authenticate a user and return a JWT
router.post("/login", login);

// Return the authenticated user's token payload
router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

module.exports = router;