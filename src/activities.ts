import { Clock } from "substreams";
import { PrivateKey, Bytes } from "@wharfkit/session";

export async function postWebhook(message: any, clock: Clock, url: string, privateKey: string) {
  const body = JSON.stringify({message, clock});
  const timestamp = String(Math.floor(Date.now().valueOf() / 1000));
  const hex = Buffer.from(body).toString("hex");
  const bytes = Bytes.from(hex);
  const signature = PrivateKey.fromString(privateKey).signMessage(bytes).toString();

  return fetch(url, {
    body,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Signature-Secp256k1': signature,
      'X-Signature-Timestamp': timestamp,
    }
  });
}