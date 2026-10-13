const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { api, mockQuery } = require("./helpers");

test("register ignores the role sent by the client", async (t) => {
  const query = mockQuery(t, (sql) =>
    sql.startsWith("SELECT") ? [[]] : [{ insertId: 7 }]
  );

  const res = await api("post", "/auth/register", {
    body: { name: "Ana", email: "ana@test.io", password: "password123", role: "admin" },
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.user.role, "analyst");
  const insertParams = query.mock.calls[1].arguments[1];
  assert.equal(insertParams[3], "analyst");
});

test("register rejects an email that already exists", async (t) => {
  mockQuery(t, () => [[{ id: 1 }]]);

  const res = await api("post", "/auth/register", {
    body: { name: "Ana", email: "ana@test.io", password: "password123" },
  });

  assert.equal(res.status, 409);
});

test("register validates the password length with a Spanish message", async (t) => {
  const query = mockQuery(t);

  const res = await api("post", "/auth/register", {
    body: { name: "Ana", email: "ana@test.io", password: "123" },
  });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /^Campo contraseña inválido/);
  assert.equal(query.mock.callCount(), 0);
});

test("login rejects a non-string email before querying the database", async (t) => {
  const query = mockQuery(t);

  const res = await api("post", "/auth/login", {
    body: { email: { email: 1 }, password: "x" },
  });

  assert.equal(res.status, 400);
  assert.equal(query.mock.callCount(), 0);
});

test("login returns a JWT with the user's role", async (t) => {
  const passwordHash = bcrypt.hashSync("password123", 4);
  mockQuery(t, () => [
    [{ id: 3, name: "Ana", email: "ana@test.io", password_hash: passwordHash, role: "viewer" }],
  ]);

  const res = await api("post", "/auth/login", {
    body: { email: "ana@test.io", password: "password123" },
  });

  assert.equal(res.status, 200);
  const payload = jwt.verify(res.body.token, process.env.JWT_SECRET);
  assert.equal(payload.role, "viewer");
  assert.equal(payload.id, 3);
});

test("login with a wrong password returns 401", async (t) => {
  const passwordHash = bcrypt.hashSync("password123", 4);
  mockQuery(t, () => [
    [{ id: 3, name: "Ana", email: "ana@test.io", password_hash: passwordHash, role: "viewer" }],
  ]);

  const res = await api("post", "/auth/login", {
    body: { email: "ana@test.io", password: "wrong-password" },
  });

  assert.equal(res.status, 401);
  assert.equal(res.body.message, "Credenciales inválidas");
});
