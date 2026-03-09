import { Navigate } from "react-router-dom";

// Prevent access to private routes when no token is stored locally
export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // Redirect unauthenticated users to the login page
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Render protected content when a token exists
  return children;
}