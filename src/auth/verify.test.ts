import { expect, setSystemTime, spyOn, test } from "bun:test";
import { cachedVerify } from "./cached.js";
import * as auth from "./ed25519.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

// This test will be invalid from January 1, 2050
test("verify", () => {
  const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";

  const expiry = new Date(2050, 0, 1);
  const expired = new Date(2000, 0, 1);

  const tests = [
    { key: publicKey, expiry: expiry, expected: true },
    { key: publicKey, expiry: expired, expected: "signature has expired" },
    { key: invalidPublicKey, expiry: expiry, expected: "invalid signature" },
    { key: invalidPublicKey, expiry: expired, expected: "signature has expired" },
  ];

  for (const test of tests) {
    setSystemTime(test.expiry);
    const { signature } = auth.sign(secretKey, 0);

    setSystemTime();
    if (typeof test.expected === "boolean") {
      expect(auth.verify(signature, test.expiry.getTime(), test.key)).toBe(test.expected);
    } else {
      expect(() => auth.verify(signature, test.expiry.getTime(), test.key)).toThrow(test.expected);
    }
  }
});

test("verify cache", () => {
  setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

  const { signature, expirationTime, publicKey } = auth.sign(secretKey, 60);
  const verifyMessageSpy = spyOn(auth, "verify");

  expect(cachedVerify(signature, expirationTime, publicKey)).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature is already known, we do not need to revalidate it
  expect(cachedVerify(signature, expirationTime, publicKey)).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature expires in 1s, but it is still valid. We do not need to revalide it.
  setSystemTime(new Date("2000-01-01T00:00:59.000Z"));
  expect(cachedVerify(signature, expirationTime, publicKey)).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature is expired, it should be removed from the cache.
  setSystemTime(new Date("2000-01-01T00:01:00.000Z"));
  expect(cachedVerify(signature, expirationTime, publicKey)).toBeInstanceOf(Error);
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);
});
