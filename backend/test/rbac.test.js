const { test } = require("node:test");
const assert = require("node:assert/strict");
const { api, mockQuery, request, app } = require("./helpers");

const validSite = { name: "Portal", url: "https://portal.test" };

test("requests without a token get 401", async () => {
  const res = await api("get", "/sites");
  assert.equal(res.status, 401);
});

test("requests with a forged token get 401", async () => {
  const res = await request(app)
    .get("/sites")
    .set("Authorization", "Bearer not.a.valid-token");
  assert.equal(res.status, 401);
});

test("viewers can read but not write", async (t) => {
  mockQuery(t, () => [[]]);

  assert.equal((await api("get", "/sites", { role: "viewer" })).status, 200);
  assert.equal(
    (await api("post", "/sites", { role: "viewer", body: validSite })).status,
    403
  );
  assert.equal(
    (await api("patch", "/findings/1", { role: "viewer", body: { status: "fixed" } })).status,
    403
  );
});

test("analysts can create sites but not archive, restore or manage users", async (t) => {
  mockQuery(t, () => [{ insertId: 1, affectedRows: 1 }]);

  assert.equal(
    (await api("post", "/sites", { role: "analyst", body: validSite })).status,
    201
  );
  assert.equal((await api("patch", "/sites/1/archive", { role: "analyst" })).status, 403);
  assert.equal((await api("patch", "/sites/1/restore", { role: "analyst" })).status, 403);
  assert.equal((await api("get", "/users", { role: "analyst" })).status, 403);
});

test("admins can archive sites", async (t) => {
  mockQuery(t, () => [{ affectedRows: 1 }]);

  const res = await api("patch", "/sites/1/archive", { role: "admin" });
  assert.equal(res.status, 200);
});
