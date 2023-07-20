import assert from "node:assert"
import { test } from "bun:test";
import { signMessage, verify } from "./signMessage.js";

test("verify", () => {
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const invalidPublicKey = "36657c7498f2ff2e9a520dcfbdad4e7c1e5354a75623165e28f6577a45a9eec3";
    const body = '{"message":"PING"}';
    const sig = "d7b6b6b76ffb3ad58337d3082bcbeef39de1c2c4cd19f9d24955974358bb85e4bbdde31d055f60b1035750b4ca07e4e4c1398924106352577509b077ddd85802"
    const timestamp = 1686865337
    const msg = Buffer.from(timestamp + body);

    assert.equal(verify(msg, sig, publicKey), true);
    assert.equal(verify(msg, sig, invalidPublicKey), false);
});

test("signMessage - special characters", () => {
    const secretKey = "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
    const body = '(蛮龙自助托管1.0.567,微信:cqml17,telegram:https://t.me/+1DiBsv2_SCM4ODZl,Download:https://cdn.chosan.cn/static/game-asist/%E8%9B%AE%E9%BE%99%E8%87%AA%E5%8A%A9%E6%89%98%E7%AE%A1%20Setup%200.1.198.exe)批量cp3a3x9mk7:电锯#9596#本次产出WOOD共3';
    const timestamp = 1686865337
    const sig = signMessage(timestamp, body, secretKey);
    const msg = Buffer.from(timestamp + body);
    assert.equal(verify(msg, sig, publicKey), true);
});