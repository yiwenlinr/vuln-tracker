const { z } = require("zod");

// Validate numeric :id route params
const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = { idParamSchema };
