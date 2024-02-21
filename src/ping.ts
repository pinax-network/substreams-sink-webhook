import { Hex } from "@noble/curves/abstract/utils";
import { keyPair } from "./auth.js";
import { postWebhook } from "./postWebhook.js";

export async function ping(url: string, privateKey?: Hex) {
  const body = JSON.stringify({ message: "PING" });
  const invalidprivateKey = keyPair().privateKey;

  // send valid signature (must respond with 200)
  try {
    await postWebhook(url, body, privateKey, { maximumAttempts: 0 });
  } catch (_e) {
    return false;
  }

  // if no private key is provided, we can't send an invalid signature
  // so we can't test the response to an invalid signature
  // so we return true
  if (!privateKey) return true;

  // send invalid signature (must NOT respond with 200)
  try {
    await postWebhook(url, body, invalidprivateKey, { maximumAttempts: 0 });
    return false;
  } catch (_e) {
    return true;
  }
}
