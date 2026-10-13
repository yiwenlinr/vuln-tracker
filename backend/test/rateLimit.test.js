// Runs in its own process (node --test isolates files), so the limiter starts empty
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { api, mockQuery } = require("./helpers");

test("the 6th failed login from the same IP gets 429", async (t) => {
  mockQuery(t, () => [[]]); // unknown user → 401

  const login = () =>
    api("post", "/auth/login", { body: { email: "x@test.io", password: "wrong" } });

  for (let i = 0; i < 5; i++) {
    assert.equal((await login()).status, 401);
  }

  const res = await login();
  assert.equal(res.status, 429);
  assert.match(res.body.message, /Demasiados intentos/);
});
