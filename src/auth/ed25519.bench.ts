import { ed25519 } from "@noble/curves/ed25519.js";
import { bench, group, run } from "mitata";
import nacl from "tweetnacl";

const secretKey = "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559db";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const body = "hello world";
const signature = "fb8b513516baa2ded8cc1d9745560b60843798a35fe6d7fc99bfcf61845f44ded8e31a175cea1abe649c9663e7f1e98f8cde3a9a53dae4158a69d3b86a753c04";

group("sign", () => {
  bench("tweetnacl", () => nacl.sign.detached(Buffer.from(body), Buffer.from(secretKey + publicKey, "hex")));
  bench("@noble/curves", () => ed25519.sign(Buffer.from(body), secretKey));
});

group("verify", () => {
  bench("tweetnacl", () => nacl.sign.detached.verify(Buffer.from(body), Buffer.from(signature, "hex"), Buffer.from(publicKey, "hex")));
  bench("@noble/curves", () => ed25519.verify(signature, Buffer.from(body), publicKey));
});

await run({ avg: true, json: false, colors: true, min_max: true, collect: false, percentiles: false });
