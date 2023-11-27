import { SignerOptions, makeSigner } from "./auth/index.js";
import { keyPair } from "./auth/utils.js";
import { postWebhook } from "./postWebhook.js";

export async function ping(url: string, signature: "cached" | "payload", signerOptions: SignerOptions) {
  const timestamp = Math.floor(Date.now().valueOf() / 1000);
  const body = JSON.stringify({ message: "PING" });
  const invalidSecretKey = keyPair().secretKey;

  const signer = makeSigner(signature, signerOptions);
  const invalidSigner = makeSigner(signature, { ...signerOptions, secretKey: invalidSecretKey });

  // send valid signature (must respond with 200)
  try {
    await postWebhook(url, timestamp, body, signer, { maximumAttempts: 0 });
  } catch (_e) {
    return false;
  }

  // send invalid signature (must NOT respond with 200)
  try {
    await postWebhook(url, timestamp, body, invalidSigner, { maximumAttempts: 0 });
    return false;
  } catch (_e) {
    return true;
  }
}
