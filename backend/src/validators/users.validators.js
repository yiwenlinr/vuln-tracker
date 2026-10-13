const { z } = require("zod");

const updateRoleSchema = z.object({
  role: z.enum(["admin", "analyst", "viewer"]),
});

module.exports = { updateRoleSchema };
