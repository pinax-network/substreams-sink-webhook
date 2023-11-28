import { beforeEach, expect, setSystemTime, spyOn, test } from "bun:test";
import { cachedSign } from "./cached.js";
import * as auth from "./ed25519.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

beforeEach(() => {
  setSystemTime();
});

// This test will be invalid from January 1, 2050
test("sign", () => {
  const expectedSignature =
    "d26299022b13c25e4889191cdb6f4ab8fa30a524bca44b1742bedeeabb145ca99790ba09467f1365f870aee1236ec8682cdc3690eda4c8266cff512447d7270b";

  // Make the token expire in 2050 by modifying the current time
  setSystemTime(new Date(2050, 0, 1));
  const { signature, expirationTime, publicKey } = auth.sign(secretKey, 0);
  setSystemTime();

  expect(signature).toBe(expectedSignature);
  expect(auth.verify(signature, expirationTime, publicKey)).toBeTrue();
});

test("sign cache", () => {
  setSystemTime(new Date("2000-01-01T00:00:00.000Z"));

  const refreshSignatureSpy = spyOn(auth, "sign");

  cachedSign(secretKey, 60);
  expect(refreshSignatureSpy).toHaveBeenCalledTimes(1);

  // Requesting the signature in the first 60% of the time window will not regenerate it (0.6*60s = 36s)
  setSystemTime(new Date("2000-01-01T00:00:35.000Z"));
  cachedSign(secretKey, 60);
  expect(refreshSignatureSpy).toHaveBeenCalledTimes(1);

  // Requesting the signature after the first 60% of the time window will regenerate it
  setSystemTime(new Date("2000-01-01T00:00:36.000Z"));
  cachedSign(secretKey, 60);
  expect(refreshSignatureSpy).toHaveBeenCalledTimes(2);
});
