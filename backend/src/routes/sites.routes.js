const express = require("express");
const router = express.Router();

const {
  getSites,
  createSite,
  archiveSite,
} = require("../controllers/sites.controller");

const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, getSites);
router.post("/", requireAuth, createSite);
router.patch("/:id/archive", requireAuth, archiveSite);

module.exports = router;