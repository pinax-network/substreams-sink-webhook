import { postWebhook } from "./postWebhook.js";
import { keyPair } from "./signMessage.js";
import { Signer } from "./signer.js";

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
