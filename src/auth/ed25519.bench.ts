import { bench, group, run } from "mitata";
import { createTimestamp, sign, verify } from "./ed25519.js";

const secretKey = "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const body = "hello world";
const timestamp = createTimestamp();
const signature = sign(timestamp, body, secretKey);

group("ed25519", () => {
  bench("sign", () => sign(timestamp, body, secretKey));
  bench("verify", () => verify(timestamp, body, signature, publicKey));
});

await run({ avg: true, json: false, colors: true, min_max: true, collect: false, percentiles: false });
