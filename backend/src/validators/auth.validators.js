const { z } = require("zod");

// Field limits match the users table in db/schema.sql.
// Unknown keys (e.g. "role") are stripped, so clients cannot choose their role.
const registerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().email().max(150),
  // bcrypt only uses the first 72 bytes of a password
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().min(1).max(150),
  password: z.string().min(1).max(128),
});

module.exports = { registerSchema, loginSchema };
