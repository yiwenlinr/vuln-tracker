// Spanish labels for the values stored in the database (which stay in English).
// One map is enough because the same value never needs two different labels.
const LABELS = {
  // Finding severity / site criticality (feminine: "severidad", "criticidad")
  critical: "Crítica",
  high: "Alta",
  medium: "Media",
  low: "Baja",

  // Finding status
  open: "Abierto",
  in_progress: "En progreso",
  fixed: "Corregido",
  accepted: "Aceptado",
  false_positive: "Falso positivo",

  // Site status
  active: "Activo",
  archived: "Archivado",

  // Site environment
  prod: "Producción",
  staging: "Staging",
  dev: "Desarrollo",

  // User roles
  admin: "Administrador",
  analyst: "Analista",
  viewer: "Lector",
};

// Return the Spanish label for a stored value (or the value itself if unknown)
export function labelFor(value) {
  return LABELS[value] ?? value;
}

// Format a date from the API for Latin American Spanish
export function formatDate(value) {
  return new Date(value).toLocaleString("es-419", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
