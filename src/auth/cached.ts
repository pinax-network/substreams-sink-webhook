import { sign, verify } from "./ed25519.js";

// Keep in memory the latest generated signature. We do not regenerate it it is still valid.
let latestSignature: ReturnType<typeof sign> = { signature: "", publicKey: "", expirationTime: 0 };

export function cachedSign(...args: Parameters<typeof sign>): ReturnType<typeof sign> {
  const [_, expirationTimeInSecs] = args;

  // Do not recalculate a signature it the latest one expires in less than 40% of the expiryTime
  if (latestSignature.expirationTime - new Date().getTime() <= 0.4 * expirationTimeInSecs * 1000) {
    latestSignature = sign(...args);
  }

  return latestSignature;
}

// Keep in memory which signatures are currently valid, and at what time they become invalid.
// This allows to skip the ed25519 validation process each time and only compare the expiration time.
const validSignatures = new Map<string, number>();

export function cachedVerify(...args: Parameters<typeof verify>): ReturnType<typeof verify> {
  const [signature, expiry] = args;

  // Quick return if the signature is already known
  const cachedSignatureExpiry = validSignatures.get(signature);
  if (cachedSignatureExpiry !== undefined) {
    if (isExpired(cachedSignatureExpiry)) {
      return new Error("signature is expired");
    }

    return true;
  }

  // Cleanup expired values from cache
  for (const [signature, expiry] of validSignatures) {
    if (isExpired(expiry)) {
      validSignatures.delete(signature);
    }
  }

  // If it is a new signature, process it normally
  const result = verify(...args);
  validSignatures.set(signature, expiry);
  return result;
}

function isExpired(expirationTime: number): boolean {
  return new Date().getTime() >= expirationTime;
}
