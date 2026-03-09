const express = require("express");
const router = express.Router();

const {
  getFindings,
  getFindingsBySite,
  createFinding,
  updateFinding,
} = require("../controllers/findings.controller");

const { requireAuth } = require("../middlewares/auth.middleware");

router.get("/", requireAuth, getFindings);
router.get("/site/:siteId", requireAuth, getFindingsBySite);
router.post("/", requireAuth, createFinding);
router.patch("/:id", requireAuth, updateFinding);

module.exports = router;