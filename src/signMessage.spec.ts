import { beforeEach, describe, expect, setSystemTime, spyOn, test } from "bun:test";
import { Signer } from "./signer.js";
import { Verifier } from "./verifier.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

describe("signatures", () => {
  beforeEach(() => {
    // Reset clock
    setSystemTime();
  });

  // This test will be invalid from January 1, 2050
  test("signMessage", () => {
    // Make the token expire in 2050 by modifying the current time
    setSystemTime(new Date(2050, 0, 1));
    const signer = new Signer(secretKey, 0);
    // Reset time to regular clock
    setSystemTime();
    const verifier = new Verifier([publicKey]);

    const expectedSignature =
      "0mKZAisTwl5IiRkc229KuPowpSS8pEsXQr7e6rsUXKmXkLoJRn8TZfhwruEjbshoLNw2kO2kyCZs_1EkR9cnC3siZXhwIjoyNTI0NjA4MDAwMDAwLCJpZCI6ImEzY2I3MzY2ZWU4Y2E3NzIyNWI0ZDQxNzcyZTI3MGU0ZTgzMWQxNzFkMWRlNzFkOTE3MDdjNDJlN2JhODJjYzkifQ";

    expect(signer.signature).toBe(expectedSignature);
    expect(verifier.verify(signer.signature)).toBeTrue();
  });

  test("signMessage cache", () => {
    setSystemTime(new Date("2000-01-01T00:00:00.000Z"));
    const signer = new Signer(secretKey, 60);
    const refreshSignatureSpy = spyOn(signer as any, "refreshSignature");

    // A signature is automatically generated when the Signer object is created
    signer.signature;
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(0);

    // Requesting the signature in the first 60% of the time window will not regenerate it (0.6*60s = 36s)
    setSystemTime(new Date("2000-01-01T00:00:35.000Z"));
    signer.signature;
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(0);

    // Requesting the signature after the first 60% of the time window will regenerate it
    setSystemTime(new Date("2000-01-01T00:00:36.000Z"));
    signer.signature;
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(1);
  });

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
      const signer = new Signer(secretKey, 0);
      setSystemTime();
      const verifier = new Verifier([test.key]);

      expect(verifier.verify(signer.signature)).toBe(test.expected);
    }
  });

  test("verify cache", () => {
    setSystemTime(new Date("2000-01-01T00:00:00.000Z"));
    const signer = new Signer(secretKey, 60);
    const { signature } = signer;

    const verifier = new Verifier([publicKey]);
    const verifyMessageSpy = spyOn(verifier as any, "verifyMessage");

    expect(verifier.verify(signature)).toBeTrue();
    expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

    // This signature is already known, we do not need to revalidate it
    expect(verifier.verify(signature)).toBeTrue();
    expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

    // This signature expires in 1s, but it is still valid. We do not need to revalide it.
    setSystemTime(new Date("2000-01-01T00:00:59.000Z"));
    expect(verifier.verify(signature)).toBeTrue();
    expect(verifyMessageSpy).toHaveBeenCalledTimes(1);

    // This signature is expired, it should be removed from the cache.
    setSystemTime(new Date("2000-01-01T00:01:00.000Z"));
    expect(verifier.verify(signature)).toBeFalse();
    // @ts-expect-error
    expect(verifier.expirationTimes).toEqual({});
    expect(verifyMessageSpy).toHaveBeenCalledTimes(1);
  });
});
