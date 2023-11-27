import { expect, test } from "bun:test";
import { makeVerifier } from "./index.js";

const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";

test("verify", () => {
  const timestamp = 1686865337;
  const body = '{"message":"PING"}';
  const signature =
    "d7b6b6b76ffb3ad58337d3082bcbeef39de1c2c4cd19f9d24955974358bb85e4bbdde31d055f60b1035750b4ca07e4e4c1398924106352577509b077ddd85802";

  const verifier = makeVerifier("payload", [publicKey]);
  const invalidVerifier = makeVerifier("payload", [invalidPublicKey]);

  expect(verifier.verify(signature, timestamp + body)).toBeTrue();
  expect(invalidVerifier.verify(signature, timestamp + body)).toBeFalse();
});
