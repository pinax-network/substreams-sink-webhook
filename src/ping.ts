import { Signer } from "./auth/signer.js";
import { keyPair } from "./auth/utils.js";
import { postWebhook } from "./postWebhook.js";

export async function ping(url: string, secretKey: string, expirationTime: number) {
  const body = JSON.stringify({ message: "PING" });
  const invalidSecretKey = keyPair().secretKey;

  const signer = new Signer(secretKey, expirationTime);
  const invalidSigner = new Signer(invalidSecretKey, expirationTime);

  // send valid signature (must respond with 200)
  try {
    await postWebhook(url, body, signer, { maximumAttempts: 0 });
  } catch (_e) {
    return false;
  }

  // send invalid signature (must NOT respond with 200)
  try {
    await postWebhook(url, body, invalidSigner, { maximumAttempts: 0 });
    return false;
  } catch (_e) {
    return true;
  }
}
