import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SitesPage from "./pages/SitesPage";
import FindingsPage from "./pages/FindingsPage";
import UsersPage from "./pages/UsersPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sites"
          element={
            <ProtectedRoute>
              <SitesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/findings"
          element={
            <ProtectedRoute>
              <FindingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Unknown URLs go to the login page (which redirects if logged in) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}