import { Navigate } from "react-router-dom";
import { clearSession, getCurrentUser, isAdmin } from "../services/session";

// Return true if the JWT exists and its "exp" claim is still in the future.
// This is only a UX check; the backend still verifies the signature.
function isTokenValid(token) {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Prevent access to private routes when there is no valid token stored locally.
// With adminOnly, non-admin users are sent back to the dashboard.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const token = localStorage.getItem("token");

  // Redirect unauthenticated or expired sessions to the login page
  if (!token || !isTokenValid(token)) {
    clearSession();
    return <Navigate to="/" replace />;
  }

  if (adminOnly && !isAdmin(getCurrentUser())) {
    return <Navigate to="/dashboard" replace />;
  }

  // Render protected content when a valid token exists
  return children;
}
