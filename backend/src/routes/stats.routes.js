const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/stats.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, getStats);

module.exports = router;