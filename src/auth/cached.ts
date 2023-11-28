import { sign, verify } from "./ed25519.js";

// Keep in memory the latest generated signature for every secret key.
// We do not regenerate them if they are still valid.
const latestSignatures = new Map<string, ReturnType<typeof sign>>();

export function cachedSign(...args: Parameters<typeof sign>): ReturnType<typeof sign> {
  const [secretKey, durationInSecs] = args;

  // Do not recalculate a signature it the latest one expires in less than 40% of the expiryTime
  let latestSignature = latestSignatures.get(secretKey);
  if (!latestSignature || generatedSignatureIsExpired(latestSignature.expirationTime, durationInSecs)) {
    latestSignature = sign(...args);
    latestSignatures.set(secretKey, latestSignature);
  }

  return latestSignature;
}

function generatedSignatureIsExpired(expirationTime: number, signatureDurationInSecs: number) {
  return expirationTime - new Date().getTime() <= 0.4 * signatureDurationInSecs * 1000;
}

// Keep in memory which signatures are currently valid, and at what time they become invalid.
// This allows to skip the ed25519 validation process each time and only compare the expiration time.
const validSignatures = new Map<string, number>();

export function cachedVerify(...args: Parameters<typeof verify>): ReturnType<typeof verify> {
  const [signature, expiry] = args;

  // Quick return if the signature is already known
  const cachedSignatureExpiry = validSignatures.get(signature);
  if (cachedSignatureExpiry !== undefined) {
    if (receivedSignatureIsExpired(cachedSignatureExpiry)) {
      return new Error("signature is expired");
    }

    return true;
  }

  // Cleanup expired values from cache
  for (const [signature, expiry] of validSignatures) {
    if (receivedSignatureIsExpired(expiry)) {
      validSignatures.delete(signature);
    }
  }

  // If it is a new signature, process it normally
  const result = verify(...args);
  validSignatures.set(signature, expiry);
  return result;
}

function receivedSignatureIsExpired(expirationTime: number): boolean {
  return new Date().getTime() >= expirationTime;
}
