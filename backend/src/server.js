const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const siteRoutes = require("./routes/sites.routes");
const findingRoutes = require("./routes/findings.routes");
const statsRoutes = require("./routes/stats.routes");

const app = express();

// Security headers
app.use(helmet());

// Log incoming requests in development format
app.use(morgan("dev"));

// Parse JSON bodies into req.body
app.use(express.json());

// Allow requests from the frontend app
app.use(
  cors({
    origin: "http://localhost:5173",
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

/**
 * Start HTTP server.
 */
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});