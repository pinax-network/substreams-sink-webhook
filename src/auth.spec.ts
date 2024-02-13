import { describe, expect, test } from "bun:test";
import * as auth from "./auth.js";

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
    expect(auth.verify(timestamp, body, signature, invalidPublicKey)).toBeFalse();
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

  test("verify - body", async () => {
    const body =
      '{"cursor":"gBCLb0z81lU8vbvZVzJkEaWwLpc_DFhqVQ3jLxVJgYH2pSTFicymUzd9bx2GlKH51RboGgmo19eZRX588ZED7YW8y7FhuSM6EHh4wNzo87Dne6KjPQlIIOhjC-iJMNncUT7SYgz9f7UI5N_nb6XZMxMyMZEuK2blizdZqoZXIfAVsHthkjz6cJ6Bga_A-YtEq-AnEuf1xn6lDzF1Lx4LOc_RNqGe6z4nN3Rq","clock":{"timestamp":"2023-06-15T04:21:58.000Z","number":250665484,"id":"0ef0da0cf870f489833ac498da073acadf895d22f3dce68483aa43cac1d27b17"},"manifest":{"chain":"wax","moduleName":"map_transfers","moduleHash":"6aa24e6aa34db4a4faf55c69c6f612aeb06053c2"},"data":{"items":[{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":2,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"banxawallet1","to":"atomicmarket","quantity":"1340.00000000 WAX","memo":"deposit","precision":8,"amount":"134000000000","value":1340},{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":7,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"atomicmarket","to":"jft4m.c.wam","quantity":"1206.00000000 WAX","memo":"AtomicMarket Sale Payout - ID #129675349","precision":8,"amount":"120600000000","value":1206}]}}';
    const timestamp = 1686802918;
    const signature = "a2e1437d2b32774418f46365d4dccb4509be5469ed24ba0d1707ce4ca76dd7fbe0b01597d9c91391fba5316e917d4dca3134a6c1f2c283d708c02cd33d5b080d";
    const isVerified = await auth.verify(timestamp, body, signature, publicKey);
    expect(isVerified).toBeTruthy();
  });

  test("ping", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";
    const body = '{"message":"PING"}';
    const sig = "d7b6b6b76ffb3ad58337d3082bcbeef39de1c2c4cd19f9d24955974358bb85e4bbdde31d055f60b1035750b4ca07e4e4c1398924106352577509b077ddd85802";
    const timestamp = 1686865337;

    expect(auth.verify(timestamp, body, sig, publicKey)).toBeTruthy();
    expect(auth.verify(timestamp, body, sig, invalidPublicKey)).toBeFalsy();
  });

  test("special characters", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const body =
      "(蛮龙自助托管1.0.567,微信:cqml17,telegram:https://t.me/+1DiBsv2_SCM4ODZl,Download:https://cdn.chosan.cn/static/game-asist/%E8%9B%AE%E9%BE%99%E8%87%AA%E5%8A%A9%E6%89%98%E7%AE%A1%20Setup%200.1.198.exe)批量cp3a3x9mk7:电锯#9596#本次产出WOOD共3";
    const timestamp = 1686865337;
    const sig = "58033ab867ff3be7eaba373a50ea8a21b716ef5b0cbab8663e48e82ad6694eec17281c132ccde4dbe61ff19e2263513e265a2da90de8748e7c70c818d489cc04";
    expect(auth.verify(timestamp, body, sig, publicKey)).toBeTruthy();
  });
});
