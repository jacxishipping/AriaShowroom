import test from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  getClientIp,
} from "./rate-limit";

test("checkRateLimit enforces sliding window and recovers after window expires", () => {
  clearAllRateLimits();
  const baseTime = 1_700_000_000_000;

  const r1 = checkRateLimit("verify:1.2.3.4", 3, 60_000, baseTime);
  const r2 = checkRateLimit("verify:1.2.3.4", 3, 60_000, baseTime + 1_000);
  const r3 = checkRateLimit("verify:1.2.3.4", 3, 60_000, baseTime + 2_000);
  const blocked = checkRateLimit("verify:1.2.3.4", 3, 60_000, baseTime + 5_000);

  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);
  assert.equal(r2.allowed, true);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 55);

  // Once the 60s window for the first hit expires, requests succeed again
  const recovered = checkRateLimit("verify:1.2.3.4", 3, 60_000, baseTime + 60_500);
  assert.equal(recovered.allowed, true);
});

test("resetRateLimit clears accumulated failures and getClientIp extracts forwarded client IP", () => {
  clearAllRateLimits();
  checkRateLimit("auth:10.0.0.1:admin@ariamotors.af", 1, 900_000);
  assert.equal(
    checkRateLimit("auth:10.0.0.1:admin@ariamotors.af", 1, 900_000).allowed,
    false
  );

  resetRateLimit("auth:10.0.0.1:admin@ariamotors.af");
  assert.equal(
    checkRateLimit("auth:10.0.0.1:admin@ariamotors.af", 1, 900_000).allowed,
    true
  );

  assert.equal(
    getClientIp({ "x-forwarded-for": "203.0.113.42, 10.0.0.1" }),
    "203.0.113.42"
  );
  const webHeaders = new Headers({ "x-real-ip": "198.51.100.7" });
  assert.equal(getClientIp(webHeaders), "198.51.100.7");
});
