import nacl from "tweetnacl";
import { Signer } from "./index.js";

export class CachedSigner implements Signer {
  // After how much time (in % of expiration time) should a token be regenerated.
  private readonly GRACE_PERIOD = 0.6;

  private publicKey: string;
  private latestSignature!: { signature: string; expiryTime: number };

  constructor(private secretKey: string, private expirationTime: number) {
    this.publicKey = this.secretKey.substring(nacl.sign.secretKeyLength);
    this.refreshSignature();
  }

  public signature(_: number, __: string) {
    if (this.latestSignature.expiryTime - this.now() <= (1 - this.GRACE_PERIOD) * this.expirationTime * 1000) {
      this.refreshSignature();
    }

    return this.latestSignature.signature;
  }

  private refreshSignature() {
    const expiryTime = this.now() + this.expirationTime * 1000;
    const payload = JSON.stringify({ exp: expiryTime, id: this.publicKey });
    const signedBuffer = nacl.sign(Buffer.from(payload), Buffer.from(this.secretKey, "hex"));

    const signature = Buffer.from(signedBuffer).toString("base64url");
    this.latestSignature = { expiryTime, signature };
  }

  private now() {
    return new Date().getTime();
  }
}
