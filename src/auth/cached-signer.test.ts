import { beforeEach, describe, expect, setSystemTime, spyOn, test } from "bun:test";
import { makeSigner, makeVerifier } from "./index.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

describe("CachedSigner", () => {
  beforeEach(() => {
    // Reset clock
    setSystemTime();
  });

  // This test will be invalid from January 1, 2050
  test("sign", () => {
    // Make the token expire in 2050 by modifying the current time
    setSystemTime(new Date(2050, 0, 1));
    const signer = makeSigner("cached", { secretKey, expirationTime: 0 });
    // Reset time to regular clock
    setSystemTime();
    const verifier = makeVerifier("cached",  [publicKey])

    const expectedSignature =
      "0mKZAisTwl5IiRkc229KuPowpSS8pEsXQr7e6rsUXKmXkLoJRn8TZfhwruEjbshoLNw2kO2kyCZs_1EkR9cnC3siZXhwIjoyNTI0NjA4MDAwMDAwLCJpZCI6ImEzY2I3MzY2ZWU4Y2E3NzIyNWI0ZDQxNzcyZTI3MGU0ZTgzMWQxNzFkMWRlNzFkOTE3MDdjNDJlN2JhODJjYzkifQ";

      const signature = signer.signature(0, "")
    expect(signature).toBe(expectedSignature);
    expect(verifier.verify(signature, "")).toBeTrue();
  });

  test("sign cache", () => {
    setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

    const signer = makeSigner("cached", { secretKey, expirationTime: 60 });
    const refreshSignatureSpy = spyOn(signer as any, "refreshSignature");

    // A signature is automatically generated when the Signer object is created
    signer.signature(0, "");
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(0);

    // Requesting the signature in the first 60% of the time window will not regenerate it (0.6*60s = 36s)
    setSystemTime(new Date("2000-01-01T00:00:35.000Z"));
    signer.signature(0, "");
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(0);

    // Requesting the signature after the first 60% of the time window will regenerate it
    setSystemTime(new Date("2000-01-01T00:00:36.000Z"));
    signer.signature(0, "");
    expect(refreshSignatureSpy).toHaveBeenCalledTimes(1);
  });
});
