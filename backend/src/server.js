require("dotenv").config({ quiet: true });

// Refuse to start with a missing or weak JWT secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error("JWT_SECRET must be set and at least 32 characters long");
  process.exit(1);
}

const pool = require("./db/pool");
const app = require("./app");

/**
 * Check the database connection, then start the HTTP server.
 */
const port = process.env.PORT || 4000;

pool
  .query("SELECT 1")
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Could not connect to the database:", error.message);
    process.exit(1);
  });
