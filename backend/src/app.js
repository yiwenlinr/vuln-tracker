const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const siteRoutes = require("./routes/sites.routes");
const findingRoutes = require("./routes/findings.routes");
const statsRoutes = require("./routes/stats.routes");
const userRoutes = require("./routes/users.routes");

// Express app without listening, so tests can use it directly with supertest
const app = express();

// Security headers
app.use(helmet());

// Log incoming requests in development format (disabled in production and tests)
if (!["production", "test"].includes(process.env.NODE_ENV)) {
  app.use(morgan("dev"));
}

// Parse JSON bodies into req.body
app.use(express.json());

// Allow requests from the frontend app (comma-separated list of origins)
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(","),
    credentials: true,
  })
);

/**
 * Health check endpoint (useful for quick sanity checks and monitoring).
 */
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/sites", siteRoutes);
app.use("/findings", findingRoutes);
app.use("/stats", statsRoutes);
app.use("/users", userRoutes);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

// Last-resort error handler (malformed JSON, unexpected exceptions).
// Express recognizes it as an error handler because it takes 4 arguments.
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "El cuerpo JSON está mal formado" });
  }

  console.error("Unhandled error:", err.message);
  return res.status(500).json({ message: "Error interno del servidor" });
});

module.exports = app;
