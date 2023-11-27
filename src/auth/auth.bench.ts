import { bench, group, run } from "mitata";
import { Signer } from "./signer.js";
import { Verifier } from "./verifier.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const signature =
  "0mKZAisTwl5IiRkc229KuPowpSS8pEsXQr7e6rsUXKmXkLoJRn8TZfhwruEjbshoLNw2kO2kyCZs_1EkR9cnC3siZXhwIjoyNTI0NjA4MDAwMDAwLCJpZCI6ImEzY2I3MzY2ZWU4Y2E3NzIyNWI0ZDQxNzcyZTI3MGU0ZTgzMWQxNzFkMWRlNzFkOTE3MDdjNDJlN2JhODJjYzkifQ";

const signer = new Signer(secretKey, 60);
const verifier = new Verifier([publicKey]);

group("sign", () => {
  // @ts-expect-error
  bench("sign - no cache", () => signer.refreshSignature());
  bench("sign - with cache", () => signer.signature);
});

group("verify", () => {
  // @ts-expect-error
  bench("verify - no cache", () => verifier.verifyMessage(signature));
  bench("verify - with cache", () => verifier.verify(signature));
});

await run({ avg: true, json: false, colors: true, min_max: true, collect: false, percentiles: false });
