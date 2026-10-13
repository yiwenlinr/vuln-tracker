const mysql = require("mysql2/promise");
require("dotenv").config({ quiet: true });


// Create a reusable MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Escape objects as strings instead of "key = value" pairs (object injection defense)
  stringifyObjects: true,
});

module.exports = pool;