import { PrivateKey } from "@wharfkit/session";
import { signMessage } from "./signMessage.js";
import { postWebhook } from "./postWebhook.js";
import { logger } from "./logger.js";

export async function ping(url: string, privateKey: PrivateKey) {
    const body = JSON.stringify({message: "PING"});
    const timestamp = Math.floor(Date.now().valueOf() / 1000);
    const signature = signMessage(body, timestamp, privateKey);
    const invalidSignature = signMessage(body, timestamp, PrivateKey.generate("K1"));

    // send valid signature (must respond with 200)
    try {
        logger.info("PING", {url, isVerified: true});
        await postWebhook(url, body, signature, timestamp, {maximumAttempts: 0});
    } catch (e) {
        logger.error("error PING valid response");
        return false;
    }
    // send invalid signature (must NOT respond with 200)
    try {
        logger.info("PING", {url, isVerified: false});
        await postWebhook(url, body, invalidSignature, timestamp, {maximumAttempts: 0});
        logger.error("error PING invalid response");
        return false;
    } catch (e) {
        return true;
    }
}