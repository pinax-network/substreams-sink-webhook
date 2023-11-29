import { bench, group, run } from "mitata";
import { cachedSign, cachedVerify } from "./cached.js";
import { sign, verify } from "./ed25519.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const { signature, expirationTime } = sign(secretKey, 60);

group("sign", () => {
  bench("sign - cache disabled", () => sign(secretKey, 60));
  bench("sign - cache enabled", () => cachedSign(secretKey, 60));
});

group("verify", () => {
  bench("verify - cache disabled", () => verify(signature, expirationTime, publicKey));
  bench("verify - cache enabled", () => cachedVerify(signature, expirationTime, publicKey));
});

await run({ avg: true, json: false, colors: true, min_max: true, collect: false, percentiles: false });
