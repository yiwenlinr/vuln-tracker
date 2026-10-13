const { z } = require("zod");

const SEVERITIES = ["critical", "high", "medium", "low"];
const STATUSES = ["open", "in_progress", "fixed", "accepted", "false_positive"];

// Optional free-text column that can also be cleared with null
const optionalText = (max) => z.string().max(max).nullable().optional();

// Field limits match the findings table in db/schema.sql
const findingFields = {
  title: z.string().trim().min(1).max(180),
  owasp: optionalText(10),
  cwe: optionalText(20),
  cvss_score: z.number().min(0).max(10).nullable().optional(),
  description: optionalText(10000),
  evidence: optionalText(10000),
  recommendation: optionalText(10000),
};

const createFindingSchema = z.object({
  ...findingFields,
  site_id: z.number().int().positive(),
  severity: z.enum(SEVERITIES).default("low"),
  status: z.enum(STATUSES).default("open"),
});

// Every field is optional on update; only the keys sent are changed
const updateFindingSchema = z.object({
  ...findingFields,
  title: findingFields.title.optional(),
  severity: z.enum(SEVERITIES).optional(),
  status: z.enum(STATUSES).optional(),
});

const siteIdParamSchema = z.object({
  siteId: z.coerce.number().int().positive(),
});

module.exports = {
  createFindingSchema,
  updateFindingSchema,
  siteIdParamSchema,
};
