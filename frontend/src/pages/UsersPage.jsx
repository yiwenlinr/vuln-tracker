import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { getCurrentUser } from "../services/session";
import Layout from "../components/Layout";
import { formatDate, labelFor } from "../utils/i18n";

const ROLES = ["admin", "analyst", "viewer"];

// Admin-only page to list users and change their role
export default function UsersPage() {
  const currentUser = getCurrentUser();

  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  async function handleRoleChange(user, role) {
    setError("");
    setNotice("");

    try {
      await api.patch(`/users/${user.id}/role`, { role });
      setNotice(
        `${user.name} ahora es ${labelFor(role)}. El cambio se aplica en su próximo inicio de sesión.`
      );
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo cambiar el rol");
    }
  }

  return (
    <Layout title="Usuarios" subtitle="Administra los roles de acceso a la aplicación">
      <div className="card">
        <h2 className="section-title">Lista de usuarios</h2>

        <p className="muted">
          Lector: solo lectura · Analista: crea y edita sitios y hallazgos ·
          Administrador: además archiva sitios y gestiona usuarios
        </p>

        {error && <p className="error-text">{error}</p>}
        {notice && <p className="success-text">{notice}</p>}
        {loading && <p className="muted">Cargando usuarios...</p>}

        {!loading && users.length > 0 && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Creado</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {/* Admins cannot change their own role (avoids lockouts) */}
                      {user.id === currentUser?.id ? (
                        <span className="muted">{labelFor(user.role)} (tú)</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          aria-label={`Rol de ${user.name}`}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {labelFor(role)}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>{formatDate(user.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
