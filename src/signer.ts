import { makeSignature } from "./signMessage.js";

export class Signer {
  private latestSignature!: { signature: string; expiryTime: number };

  constructor(public secretKey: string, public expirationTime: number) {
    this.refreshSignature();
  }

  public get signature() {
    if (this.latestSignature.expiryTime - this.now() < 0.6 * this.expirationTime * 1000) {
      this.refreshSignature();
    }

    return this.latestSignature.signature;
  }

  private refreshSignature() {
    const expiryTime = this.nextExpiredTime();
    const signature = makeSignature(expiryTime, this.secretKey);
    this.latestSignature = { expiryTime, signature };
  }

  private now() {
    return new Date().getTime();
  }

  private nextExpiredTime() {
    return this.now() + this.expirationTime * 1000;
  }
}
