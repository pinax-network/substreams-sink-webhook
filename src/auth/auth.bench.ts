import { bench, group, run } from "mitata";
import { makeSigner, makeVerifier } from "./index.js";

const secretKey =
  "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

const cacheSignature =
  "0mKZAisTwl5IiRkc229KuPowpSS8pEsXQr7e6rsUXKmXkLoJRn8TZfhwruEjbshoLNw2kO2kyCZs_1EkR9cnC3siZXhwIjoyNTI0NjA4MDAwMDAwLCJpZCI6ImEzY2I3MzY2ZWU4Y2E3NzIyNWI0ZDQxNzcyZTI3MGU0ZTgzMWQxNzFkMWRlNzFkOTE3MDdjNDJlN2JhODJjYzkifQ";
const payloadSignature = "c3233e06e21bae7dce5428091abbcea94c75e4a0b6b5a52a435f36053d178ca6aac58c507f8bba9aaccd3fe175dad1a4a0590ad18763662b735888338ebe0509";

const body =
  '{"cursor":"gBCLb0z81lU8vbvZVzJkEaWwLpc_DFhqVQ3jLxVJgYH2pSTFicymUzd9bx2GlKH51RboGgmo19eZRX588ZED7YW8y7FhuSM6EHh4wNzo87Dne6KjPQlIIOhjC-iJMNncUT7SYgz9f7UI5N_nb6XZMxMyMZEuK2blizdZqoZXIfAVsHthkjz6cJ6Bga_A-YtEq-AnEuf1xn6lDzF1Lx4LOc_RNqGe6z4nN3Rq","clock":{"timestamp":"2023-06-15T04:21:58.000Z","number":250665484,"id":"0ef0da0cf870f489833ac498da073acadf895d22f3dce68483aa43cac1d27b17"},"manifest":{"chain":"wax","moduleName":"map_transfers","moduleHash":"6aa24e6aa34db4a4faf55c69c6f612aeb06053c2"},"data":{"items":[{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":2,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"banxawallet1","to":"atomicmarket","quantity":"1340.00000000 WAX","memo":"deposit","precision":8,"amount":"134000000000","value":1340},{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":7,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"atomicmarket","to":"jft4m.c.wam","quantity":"1206.00000000 WAX","memo":"AtomicMarket Sale Payout - ID #129675349","precision":8,"amount":"120600000000","value":1206}]}}';

const payloadSigner = makeSigner("payload", { secretKey, expirationTime: 0 });
const payloadVerifier = makeVerifier("payload", [publicKey]);

const cacheSigner = makeSigner("cached", { secretKey, expirationTime: 60 });
const cacheVerifier = makeVerifier("cached", [publicKey]);


group("sign", () => {
  // @ts-expect-error
  bench("[--signature cached] sign - cache disabled", () => cacheSigner.refreshSignature());
  bench("[--signature cached] sign - cache enabled", () => cacheSigner.signature(0, body));
  bench("[--signature payload] sign", () => payloadSigner.signature(0, body));
});

group("verify", () => {
  // @ts-expect-error
  bench("[--signature cached] verify - cache disabled", () => cacheVerifier.verifyMessage(cacheSignature));
  bench("[--signature cached] verify - cache enabled", () => cacheVerifier.verify(cacheSignature, ""));
  bench("[--signature payload] verify", () => payloadVerifier.verify(payloadSignature, body));
});

await run({ avg: true, json: false, colors: true, min_max: true, collect: false, percentiles: false });
