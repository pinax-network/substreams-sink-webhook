import { CachedSigner } from "./cached-signer.js";
import { CachedVerifier } from "./cached-verifier.js";
import { PayloadSigner } from "./payload-signer.js";
import { PayloadVerifier } from "./payload-verifier.js";

export const authModes = ["cached", "payload"] as const;
export type AuthMode = (typeof authModes)[number];

export type Signer = {
  signature(timestamp: number, body: string): string;
};

export type SignerOptions = {
  secretKey: string;
  expirationTime: number;
};

export function makeSigner(type: AuthMode, options: SignerOptions): Signer {
  switch (type) {
    case "cached":
      return new CachedSigner(options.secretKey, options.expirationTime);
    case "payload":
      return new PayloadSigner(options.secretKey);
    default:
      const _: never = type;
      throw new Error(`Invalid signer type: '${type}'`);
  }
}

export type Verifier = {
  verify(signature: string, message: string): boolean;
};

export function makeVerifier(type: AuthMode, publicKeys: [string, ...string[]]): Verifier {
  switch (type) {
    case "cached":
      return new CachedVerifier(publicKeys);
    case "payload":
      return new PayloadVerifier(publicKeys[0]);
    default:
      const _: never = type;
      throw new Error(`Invalid verifier type: '${type}'`);
  }
}
