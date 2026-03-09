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

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/sites", siteRoutes);
app.use("/findings", findingRoutes);
app.use("/stats", statsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});