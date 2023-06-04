import { Bytes, PrivateKey } from "@wharfkit/session";

export function signMessage(body: string, timestamp: number, privateKey: PrivateKey) {
  const hex = Buffer.from(timestamp + body).toString("hex");
  const bytes = Bytes.from(hex);
  return privateKey.signMessage(bytes).toString();
}
