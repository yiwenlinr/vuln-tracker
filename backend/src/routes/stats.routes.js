const express = require("express");
const router = express.Router();

// Import dashboard stats controller
const { getStats } = require("../controllers/stats.controller");

// Import JWT protection middleware
const { requireAuth } = require("../middlewares/auth.middleware");

// Return aggregated dashboard stats
router.get("/", requireAuth, getStats);

module.exports = router;