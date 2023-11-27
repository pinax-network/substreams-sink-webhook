import nacl from "tweetnacl";
import { Signer } from "./index.js";

export class PayloadSigner implements Signer {
  constructor(private secretKey: string) {}

  public signature(timestamp: number, body: string): string {
    const msg = Buffer.from(timestamp + body);
    const signed = nacl.sign.detached(msg, Buffer.from(this.secretKey, "hex"));
    return Buffer.from(signed).toString("hex");
  }
}
