import { postWebhook } from "./postWebhook.js";
import { keyPair, signMessage } from "./signMessage.js";

export async function ping(url: string, secretKey: string) {
  const body = JSON.stringify({ message: "PING" });
  const timestamp = Math.floor(Date.now().valueOf() / 1000);
  const signature = signMessage(timestamp, body, secretKey);
  const invalidSecretKey = keyPair().secretKey;
  const invalidSignature = signMessage(timestamp, body, invalidSecretKey);

  // send valid signature (must respond with 200)
  try {
    await postWebhook(url, body, signature, timestamp, { maximumAttempts: 0 });
  } catch (_e) {
    return false;
  }
  // send invalid signature (must NOT respond with 200)
  try {
    await postWebhook(url, body, invalidSignature, timestamp, {
      maximumAttempts: 0,
    });
    return false;
  } catch (_e) {
    return true;
  }
}
