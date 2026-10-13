// Shared setup for the API tests. The database is never touched:
// each test replaces pool.query with a mock (see mockQuery).
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret_that_is_at_least_32_characters_long";

const jwt = require("jsonwebtoken");
const request = require("supertest");
const app = require("../src/app");
const pool = require("../src/db/pool");

// Sign a JWT like the login endpoint does
function tokenFor(role, id = 1) {
  return jwt.sign({ id, email: `${role}@test.io`, role }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });
}

// Replace pool.query for the duration of a test. `handler(sql, params)` returns
// the rows/result for each query; every call is recorded in mock.calls.
function mockQuery(t, handler = () => [[]]) {
  return t.mock.method(pool, "query", async (sql, params) => handler(sql, params));
}

// supertest helper with an optional Bearer token
function api(method, url, { role, body } = {}) {
  let req = request(app)[method](url);
  if (role) req = req.set("Authorization", `Bearer ${tokenFor(role)}`);
  if (body !== undefined) req = req.send(body);
  return req;
}

module.exports = { api, mockQuery, tokenFor, request, app };
