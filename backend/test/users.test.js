const { test } = require("node:test");
const assert = require("node:assert/strict");
const { api, mockQuery } = require("./helpers");

test("admins can list users without password hashes", async (t) => {
  const query = mockQuery(t, () => [[{ id: 1, name: "Admin", role: "admin" }]]);

  const res = await api("get", "/users", { role: "admin" });

  assert.equal(res.status, 200);
  assert.doesNotMatch(query.mock.calls[0].arguments[0], /password_hash/);
});

test("admins can change another user's role", async (t) => {
  const query = mockQuery(t, () => [{ affectedRows: 1 }]);

  const res = await api("patch", "/users/2/role", {
    role: "admin",
    body: { role: "viewer" },
  });

  assert.equal(res.status, 200);
  assert.deepEqual(query.mock.calls[0].arguments[1], ["viewer", 2]);
});

test("admins cannot change their own role", async (t) => {
  const query = mockQuery(t);

  // tokenFor() signs the admin with id 1
  const res = await api("patch", "/users/1/role", {
    role: "admin",
    body: { role: "viewer" },
  });

  assert.equal(res.status, 400);
  assert.equal(query.mock.callCount(), 0);
});

test("invalid roles are rejected", async (t) => {
  mockQuery(t);

  const res = await api("patch", "/users/2/role", {
    role: "admin",
    body: { role: "superadmin" },
  });

  assert.equal(res.status, 400);
});

test("changing the role of a missing user returns 404", async (t) => {
  mockQuery(t, () => [{ affectedRows: 0 }]);

  const res = await api("patch", "/users/99/role", {
    role: "admin",
    body: { role: "viewer" },
  });

  assert.equal(res.status, 404);
});
