const { test } = require("node:test");
const assert = require("node:assert/strict");
const { api, mockQuery } = require("./helpers");

test("create site rejects non-http URLs", async (t) => {
  const query = mockQuery(t);

  const res = await api("post", "/sites", {
    role: "analyst",
    body: { name: "XSS", url: "javascript:alert(1)" },
  });

  assert.equal(res.status, 400);
  assert.match(res.body.message, /URL/);
  assert.equal(query.mock.callCount(), 0);
});

test("restore only moves archived sites back to active", async (t) => {
  const query = mockQuery(t, () => [{ affectedRows: 1 }]);

  const res = await api("patch", "/sites/5/restore", { role: "admin" });

  assert.equal(res.status, 200);
  assert.deepEqual(query.mock.calls[0].arguments[1], ["active", "5", "archived"]);
});

test("restore returns 404 when the site is missing or already active", async (t) => {
  mockQuery(t, () => [{ affectedRows: 0 }]);

  const res = await api("patch", "/sites/5/restore", { role: "admin" });
  assert.equal(res.status, 404);
});

test("non-numeric site ids are rejected", async (t) => {
  mockQuery(t);

  const res = await api("patch", "/sites/abc/archive", { role: "admin" });
  assert.equal(res.status, 400);
});
