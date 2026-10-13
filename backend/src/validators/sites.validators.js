const { z } = require("zod");

// Field limits match the sites table in db/schema.sql
const createSiteSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: z
    .string()
    .trim()
    .max(255)
    .regex(/^https?:\/\/\S+$/i, "Debe ser una URL http(s)"),
  owner: z.string().trim().max(120).nullable().optional(),
  environment: z.enum(["prod", "dev", "staging"]).default("prod"),
  criticality: z.enum(["low", "medium", "high"]).default("medium"),
});

module.exports = { createSiteSchema };
