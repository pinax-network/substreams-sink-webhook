import nacl from "tweetnacl";
import { Verifier } from "./index.js";

export class PayloadVerifier implements Verifier {
  constructor(private publicKey: string) {}

  verify(signature: string, message: string): boolean {
    return nacl.sign.detached.verify(
      Buffer.from(message),
      Buffer.from(signature, "hex"),
      Buffer.from(this.publicKey, "hex")
    );
  }
}
