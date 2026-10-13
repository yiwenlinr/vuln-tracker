import { useLocation, useNavigate } from "react-router-dom";
import { clearSession, getCurrentUser, isAdmin } from "../services/session";
import { labelFor } from "../utils/i18n";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Panel" },
  { path: "/sites", label: "Sitios" },
  { path: "/findings", label: "Hallazgos" },
  { path: "/users", label: "Usuarios", adminOnly: true },
];

// Shared page shell: title, navigation to the other pages, user info and logout
export default function Layout({ title, subtitle, children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getCurrentUser();

  // Links to every page except the current one (and admin pages for admins only)
  const navItems = NAV_ITEMS.filter(
    (item) => item.path !== pathname && (!item.adminOnly || isAdmin(user))
  );

  // Clear the current session and go back to login
  function handleLogout() {
    clearSession();
    navigate("/");
  }

  return (
    <div className="page-container">
      <div className="topbar">
        <div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>

        <div className="topbar-actions">
          {user && (
            <span className="muted user-info">
              {user.name} · {labelFor(user.role)}
            </span>
          )}

          {navItems.map((item) => (
            <button
              key={item.path}
              className="secondary"
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}

          <button className="danger" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {children}
    </div>
  );
}
