// Allowed values, matching the backend validators
export const SEVERITIES = ["critical", "high", "medium", "low"];
export const FINDING_STATUSES = [
  "open",
  "in_progress",
  "fixed",
  "accepted",
  "false_positive",
];

// Next status for the "Advance Status" action (only open → in_progress → fixed)
export const NEXT_STATUS = {
  open: "in_progress",
  in_progress: "fixed",
};

// Initial state of the "Create Finding" form
export const EMPTY_FINDING_FORM = {
  site_id: "",
  title: "",
  severity: "low",
  status: "open",
  owasp: "",
  cwe: "",
  cvss_score: "",
  description: "",
  evidence: "",
  recommendation: "",
};

const NULLABLE_TEXT_FIELDS = [
  "owasp",
  "cwe",
  "description",
  "evidence",
  "recommendation",
];

// Convert form state (all strings) into the payload the API expects
export function toFindingPayload(form) {
  const payload = {
    ...form,
    cvss_score: form.cvss_score === "" ? null : Number(form.cvss_score),
  };

  for (const field of NULLABLE_TEXT_FIELDS) {
    if (payload[field] === "") payload[field] = null;
  }

  if ("site_id" in payload) payload.site_id = Number(payload.site_id);

  return payload;
}

// Convert a finding from the API into editable form state (no site_id)
export function findingToForm(finding) {
  return {
    title: finding.title,
    severity: finding.severity,
    status: finding.status,
    owasp: finding.owasp ?? "",
    cwe: finding.cwe ?? "",
    cvss_score: finding.cvss_score ?? "",
    description: finding.description ?? "",
    evidence: finding.evidence ?? "",
    recommendation: finding.recommendation ?? "",
  };
}
