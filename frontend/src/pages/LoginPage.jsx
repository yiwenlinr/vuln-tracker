import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();

  // Local state for login form
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Local state for login errors
  const [error, setError] = useState("");

  // Update form state on input changes
  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  // Submit login request to the backend
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", form);

      // Save session data locally
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo iniciar sesión");
    }
  }

  // Redirect already authenticated users to the dashboard
  // (ProtectedRoute sends them back here if the token has expired)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="login-container">
      <div className="card">
        <h1 className="section-title">Vuln Tracker</h1>
        <p className="muted">Inicia sesión para gestionar sitios y hallazgos</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="full-width">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}
