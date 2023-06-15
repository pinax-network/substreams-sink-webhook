import { keyPair, signMessage } from "./signMessage.js";
import { postWebhook } from "./postWebhook.js";
import { logger } from "./logger.js";

export async function ping(url: string, secretKey: string) {
    const body = JSON.stringify({message: "PING"});
    const timestamp = Math.floor(Date.now().valueOf() / 1000);
    const signature = signMessage(timestamp, body, secretKey);
    const invalidSecretKey = keyPair().secretKey;
    const invalidSignature = signMessage(timestamp, body, invalidSecretKey);

    // send valid signature (must respond with 200)
    try {
        logger.info("PING valid request", {url, timestamp, signature, body, isVerified: true});
        await postWebhook(url, body, signature, timestamp, {maximumAttempts: 0});
    } catch (e) {
        logger.error("error PING valid response");
        return false;
    }
    // send invalid signature (must NOT respond with 200)
    try {
        logger.info("PING invalid request", {url, timestamp, invalidSignature, body, invalidSecretKey, isVerified: false});
        await postWebhook(url, body, invalidSignature, timestamp, {maximumAttempts: 0});
        logger.error("error PING invalid response");
        return false;
    } catch (e) {
        return true;
    }
}