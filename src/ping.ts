import { keyPair } from "./auth/ed25519.js";
import { postWebhook } from "./postWebhook.js";

export async function ping(url: string, secretKey: string, expiryTime: number) {
  const body = JSON.stringify({ message: "PING" });
  const invalidSecretKey = keyPair().secretKey;

  // send valid signature (must respond with 200)
  try {
    await postWebhook(url, body, secretKey, expiryTime, { maximumAttempts: 0 });
  } catch (_e) {
    return false;
  }

  // send invalid signature (must NOT respond with 200)
  try {
    await postWebhook(url, body, invalidSecretKey, expiryTime, { maximumAttempts: 0 });
    return false;
  } catch (_e) {
    return true;
  }
}
