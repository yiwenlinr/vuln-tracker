const { test } = require("node:test");
const assert = require("node:assert/strict");
const { api, mockQuery } = require("./helpers");

const validFinding = { site_id: 1, title: "SQL Injection" };

test("create finding validates lengths, ranges and types", async (t) => {
  const query = mockQuery(t);
  const create = (body) =>
    api("post", "/findings", { role: "analyst", body: { ...validFinding, ...body } });

  assert.equal((await create({ title: "a".repeat(181) })).status, 400);
  assert.equal((await create({ cvss_score: 15 })).status, 400);
  assert.equal((await create({ severity: "urgent" })).status, 400);
  assert.equal((await create({ site_id: { id: 1 } })).status, 400);
  assert.equal(query.mock.callCount(), 0);
});

test("create finding fails when the site does not exist", async (t) => {
  mockQuery(t, () => [[]]);

  const res = await api("post", "/findings", { role: "analyst", body: validFinding });
  assert.equal(res.status, 404);
});

test("create finding fails on an archived site", async (t) => {
  const query = mockQuery(t, () => [[{ id: 1, status: "archived" }]]);

  const res = await api("post", "/findings", { role: "analyst", body: validFinding });

  assert.equal(res.status, 400);
  assert.equal(query.mock.callCount(), 1); // no INSERT
});

test("create finding applies defaults on an active site", async (t) => {
  const query = mockQuery(t, (sql) =>
    sql.startsWith("SELECT") ? [[{ id: 1, status: "active" }]] : [{ insertId: 9 }]
  );

  const res = await api("post", "/findings", { role: "analyst", body: validFinding });

  assert.equal(res.status, 201);
  assert.equal(res.body.finding.severity, "low");
  assert.equal(res.body.finding.status, "open");
  assert.equal(query.mock.callCount(), 2);
});

test("PATCH only updates the fields that were sent and null clears a field", async (t) => {
  const query = mockQuery(t, () => [{ affectedRows: 1 }]);

  const res = await api("patch", "/findings/4", {
    role: "analyst",
    body: { status: "fixed", cwe: null },
  });

  assert.equal(res.status, 200);
  const [sql, params] = query.mock.calls[0].arguments;
  assert.match(sql, /SET status = \?, cwe = \? WHERE id = \?/);
  assert.deepEqual(params, ["fixed", null, "4"]);
});

test("PATCH ignores unknown fields and rejects an empty update", async (t) => {
  const query = mockQuery(t);

  const res = await api("patch", "/findings/4", {
    role: "analyst",
    body: { site_id: 2, id: 99 },
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.message, "No hay campos para actualizar");
  assert.equal(query.mock.callCount(), 0);
});

test("PATCH returns 404 for a missing finding", async (t) => {
  mockQuery(t, () => [{ affectedRows: 0 }]);

  const res = await api("patch", "/findings/999", {
    role: "analyst",
    body: { status: "fixed" },
  });

  assert.equal(res.status, 404);
});
