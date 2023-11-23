import { expect, test } from "bun:test";
import { makeSignature, verify } from "./signMessage.js";

test("signMessage", () => {
  const secretKey =
    "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
  const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
  const expectedSignature =
    "0mKZAisTwl5IiRkc229KuPowpSS8pEsXQr7e6rsUXKmXkLoJRn8TZfhwruEjbshoLNw2kO2kyCZs_1EkR9cnC3siZXhwIjoyNTI0NjA4MDAwMDAwLCJpZCI6ImEzY2I3MzY2ZWU4Y2E3NzIyNWI0ZDQxNzcyZTI3MGU0ZTgzMWQxNzFkMWRlNzFkOTE3MDdjNDJlN2JhODJjYzkifQ";

  const expiry = new Date(2050, 0, 1).getTime();
  const signature = makeSignature(expiry, secretKey);

  expect(signature).toBe(expectedSignature);
  expect(verify(Buffer.from(signature, "base64url"), publicKey)).toBeTrue();
});

test("verify", () => {
  const secretKey =
    "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
  const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
  const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";

  const expiry = new Date(2050, 0, 1).getTime();
  const expired = new Date(2000, 0, 1).getTime();

  const tests = [
    { key: publicKey, expiry: expiry, expected: true },
    { key: publicKey, expiry: expired, expected: false },
    { key: invalidPublicKey, expiry: expired, expected: false },
    { key: invalidPublicKey, expiry: expired, expected: false },
  ];

  for (const test of tests) {
    const signature = makeSignature(test.expiry, secretKey);
    expect(verify(Buffer.from(signature, "base64url"), test.key)).toBe(test.expected);
  }
});
