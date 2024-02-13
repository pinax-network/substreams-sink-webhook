import { describe, expect, test } from "bun:test";
import * as auth from "./ed25519.js";

const privateKey = "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559db";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const body = `{"status":200,"cursor":"OJGbpO9ZnZcwvxW38_FO8KWwLpcyA1lrUQPgKRFL04Py8yCW35v1VTB1O0-Elami3RztQlOp2tmcHC9y9ZQFuoDrxLpj6yU-FXorwoHr_OfqLPumMQwTJ-hgWeuKYNLeWDjTagn4ersEtNGzbvLaY0UxZZUhK2G62z1VptdXJfEWuiJmyjmrIZrRhK-WoNAS_rEkQ7L1xCmhDzJ4K0dTPcSDNPKZuDR2","session":{"traceId":"3cbb0a1c772a47a72995d95f4c6d2cff","resolvedStartBlock":53448515},"clock":{"timestamp":"2024-02-12T22:23:51.000Z","number":53448530,"id":"f843bc26cea0cbd50b09699546a8a97de6a1727646c17a857c5d8d868fc26142"},"manifest":{"substreamsEndpoint":"https://polygon.substreams.pinax.network:443","chain":"polygon","finalBlockOnly":"false","moduleName":"map_blocks","type":"sf.substreams.v1.Clock","moduleHash":"44c506941d5f30db6cca01692624395d1ac40cd1"},"data":{"id":"f843bc26cea0cbd50b09699546a8a97de6a1727646c17a857c5d8d868fc26142","number":"53448530","timestamp":"2024-02-12T22:23:51Z"}}`;
const signature = "8f01c66ccda5b987c43d913290419572ea586dbef2077fa166c4a84797e1d2c76b305bc67ed43efb1fc841562620a61cb59c4d8a13de689a2e98ead19190f80c";
const timestamp = 1707776632;

describe("sign", () => {
  test("sign", () => {
    const signature = auth.sign(timestamp, body, privateKey);
    expect(signature).toBe(signature);
  });

  test("error - missing body", () => {
    expect(() => auth.sign(timestamp, "", privateKey)).toThrow("missing body");
  });

  test("error - invalid private key length", () => {
    expect(() => auth.sign(timestamp, body, "")).toThrow("invalid private key length");
  });

  test("error - invalid timestamp", () => {
    expect(() => auth.sign(0, body, privateKey)).toThrow("invalid timestamp");
    expect(() => auth.sign(Number("abc"), body, privateKey)).toThrow("invalid timestamp");
  });
});

describe("verify", () => {
  test("verify", () => {
    expect(auth.verify(timestamp, body, signature, publicKey)).toBeTrue();
  });

  test("error - invalid signature", () => {
    const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";
    expect(() => auth.verify(timestamp, body, signature, invalidPublicKey)).toThrow("invalid signature");
  });

  test("error - missing body", () => {
    expect(() => auth.verify(timestamp, "", signature, publicKey)).toThrow("missing body");
  });

  test("error - invalid signature length", () => {
    expect(() => auth.verify(timestamp, body, "foobar", publicKey)).toThrow("invalid signature length");
  });

  test("error - invalid timestamp", () => {
    expect(() => auth.verify(0, body, signature, publicKey)).toThrow("invalid timestamp");
    expect(() => auth.verify(Number("abc"), body, signature, publicKey)).toThrow("invalid timestamp");
  });

  test("error - invalid public key length", () => {
    expect(() => auth.verify(timestamp, body, signature, "foobar")).toThrow("invalid public key length");
  });
});
