const express = require("express");
const router = express.Router();

// Import site controller handlers
const {
  getSites,
  createSite,
  archiveSite,
} = require("../controllers/sites.controller");

// Import JWT protection middleware
const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, getSites);
router.post("/", requireAuth, createSite);
router.patch("/:id/archive", requireAuth, archiveSite);

module.exports = router;