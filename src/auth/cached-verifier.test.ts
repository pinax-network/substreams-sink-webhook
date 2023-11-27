import { expect, setSystemTime, spyOn, test } from "bun:test";
import { makeSigner, makeVerifier } from "./index.js";

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
    { key: publicKey, expiry: expired, expected: false },
    { key: invalidPublicKey, expiry: expired, expected: false },
    { key: invalidPublicKey, expiry: expired, expected: false },
  ];

  for (const test of tests) {
    setSystemTime(test.expiry);
    const signer = makeSigner("cached", { secretKey, expirationTime: 0 });
    setSystemTime();
    const verifier = makeVerifier("cached", [test.key]);

    expect(verifier.verify(signer.signature(0, ""), "")).toBe(test.expected);
  }
});

test("verify cache", () => {
  setSystemTime(new Date("2000-01-01T00:00:00.000Z"));
  const signer = makeSigner("cached", { secretKey, expirationTime: 60 });
  const signature = signer.signature(0, "");

  const verifier = makeVerifier("cached", [publicKey]);
  const verifyMessageSpy = spyOn(verifier as any, "verifyMessage");

  expect(verifier.verify(signature, "")).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature is already known, we do not need to revalidate it
  expect(verifier.verify(signature, "")).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature expires in 1s, but it is still valid. We do not need to revalide it.
  setSystemTime(new Date("2000-01-01T00:00:59.000Z"));
  expect(verifier.verify(signature, "")).toBeTrue();
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

  // This signature is expired, it should be removed from the cache.
  setSystemTime(new Date("2000-01-01T00:01:00.000Z"));
  expect(verifier.verify(signature, "")).toBeFalse();
  // @ts-expect-error
  expect(verifier.expirationTimes).toEqual({});
  expect(verifyMessageSpy).toHaveBeenCalledTimes(1);
});
