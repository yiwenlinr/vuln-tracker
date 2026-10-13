// Helpers for the session data stored in localStorage after login

// Remove the stored session data
export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Return the logged-in user ({ id, name, email, role }) or null
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

// Mirror the backend RBAC rules so the UI only shows allowed actions.
// The backend still enforces them; this only hides buttons and forms.
export function canEdit(user) {
  return ["admin", "analyst"].includes(user?.role);
}

export function isAdmin(user) {
  return user?.role === "admin";
}
