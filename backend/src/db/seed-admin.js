// Create (or promote) an admin user.
// Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] npm run seed:admin
const bcrypt = require("bcrypt");
const pool = require("./pool");

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Admin" } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD (min 8 characters) are required"
    );
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Insert the admin, or reset role and password if the email already exists
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
  );

  console.log(`Admin user ready: ${ADMIN_EMAIL}`);
}

seedAdmin()
  .catch((error) => {
    console.error("Seed admin error:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
