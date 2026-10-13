const express = require("express");
const router = express.Router();

// Import user controller handlers
const {
  getUsers,
  updateUserRole,
} = require("../controllers/users.controller");

// Import JWT protection and role middlewares
const {
  requireAuth,
  requireRole,
} = require("../middlewares/auth.middleware");
const { validate } = require("../middlewares/validate.middleware");
const { idParamSchema } = require("../validators/common.validators");
const { updateRoleSchema } = require("../validators/users.validators");

// All user management is admin-only
router.use(requireAuth, requireRole("admin"));

router.get("/", getUsers);
router.patch(
  "/:id/role",
  validate({ params: idParamSchema, body: updateRoleSchema }),
  updateUserRole
);

module.exports = router;
