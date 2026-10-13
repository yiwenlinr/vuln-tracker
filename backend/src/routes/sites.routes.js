const express = require("express");
const router = express.Router();

// Import site controller handlers
const {
  getSites,
  createSite,
  archiveSite,
  restoreSite,
} = require("../controllers/sites.controller");

// Import JWT protection and role middlewares
const {
  requireAuth,
  requireRole,
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { idParamSchema } = require("../validators/common.validators");
const { createSiteSchema } = require("../validators/sites.validators");

router.get("/", requireAuth, getSites);
router.post(
  "/",
  requireAuth,
  requireRole("admin", "analyst"),
  validate({ body: createSiteSchema }),
  createSite
);
router.patch(
  "/:id/archive",
  requireAuth,
  requireRole("admin"),
  validate({ params: idParamSchema }),
  archiveSite
);
router.patch(
  "/:id/restore",
  requireAuth,
  requireRole("admin"),
  validate({ params: idParamSchema }),
  restoreSite
);

module.exports = router;
