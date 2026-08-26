import assert from "node:assert/strict";
import test from "node:test";
import { tokenSign, tokenVerify } from "../src/utils/jwt.js";

test("signs and verifies administrator tokens", async () => {
  const previousSecret = process.env.SESSION_SECRET;
  process.env.SESSION_SECRET = "test-session-secret";

  try {
    const token = await tokenSign({ email: "admin@example.com", role: "admin" }, "1m");
    const req = { headers: { authorization: `Bearer ${token}` } };
    let status;
    const res = {
      status(code) {
        status = code;
        return this;
      },
      send() {
        return this;
      },
    };
    let nextCalled = false;
    await tokenVerify(req, res, () => {
      nextCalled = true;
    });

    assert.equal(status, undefined);
    assert.equal(nextCalled, true);
    assert.equal(req.admin.email, "admin@example.com");
  } finally {
    if (previousSecret === undefined) delete process.env.SESSION_SECRET;
    else process.env.SESSION_SECRET = previousSecret;
  }
});
