import assert from "node:assert"
import { test } from "bun:test";
import { verify } from "./signMessage.js";

test("signMessage", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";
    const body = '{"message":"PING"}';
    const sig = "c66a5e1741110b7509d167db723b5a833a0ff4d823ac723037642168ee4843ae1b83c0063e51e5ad69029c97b4b7badf80005f196c0230af9de1bfbf7700a001"
    const timestamp = 1686865337
    const msg = Buffer.from(body + timestamp);

    assert.equal(verify(msg, sig, publicKey), true);
    assert.equal(verify(msg, sig, invalidPublicKey), false);
});