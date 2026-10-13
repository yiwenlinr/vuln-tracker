const express = require("express");
const router = express.Router();

// Import finding controller handlers
const {
  getFindings,
  getFindingsBySite,
  createFinding,
  updateFinding,
} = require("../controllers/findings.controller");

// Import JWT protection and role middlewares
const {
  requireAuth,
  requireRole,
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { idParamSchema } = require("../validators/common.validators");
const {
  createFindingSchema,
  updateFindingSchema,
  siteIdParamSchema,
} = require("../validators/findings.validators");

router.get("/", requireAuth, getFindings);
router.get(
  "/site/:siteId",
  requireAuth,
  validate({ params: siteIdParamSchema }),
  getFindingsBySite
);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "analyst"),
  validate({ body: createFindingSchema }),
  createFinding
);
router.patch(
  "/:id",
  requireAuth,
  requireRole("admin", "analyst"),
  validate({ params: idParamSchema, body: updateFindingSchema }),
  updateFinding
);

module.exports = router;
