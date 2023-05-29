import { Clock } from "substreams";
import { PrivateKey, Bytes } from "@wharfkit/session";

export async function postWebhook(message: any, clock: Clock, moduleName: string, moduleHash: string, url: string, privateKey: string) {
  const body = JSON.stringify({clock, moduleName, moduleHash, message});
  const timestamp = String(Math.floor(Date.now().valueOf() / 1000));
  const hex = Buffer.from(timestamp + body).toString("hex");
  const bytes = Bytes.from(hex);
  const key = PrivateKey.fromString(privateKey);
  const signature = key.signMessage(bytes).toString();

  const response = await fetch(url, {
    body,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-signature-secp256k1': signature,
      'x-signature-timestamp': timestamp,
    }
  });
  const text = await response.text();
  return {signature, timestamp, response: text};
}
