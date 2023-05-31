import { Bytes, PrivateKey } from "@wharfkit/session";

export function signMessage(body: string, timestamp: number, privateKey: string) {
  const hex = Buffer.from(timestamp + body).toString("hex");
  const bytes = Bytes.from(hex);
  const key = PrivateKey.fromString(privateKey);
  return key.signMessage(bytes).toString();
}
