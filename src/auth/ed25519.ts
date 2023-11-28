import nacl from "tweetnacl";

export function sign(secretKey: string, expirationTimeInSecs: number) {
  const publicKey = secretKey.substring(nacl.sign.secretKeyLength);
  const expirationTime = new Date().getTime() + expirationTimeInSecs * 1000;

  const payload = JSON.stringify({ exp: expirationTime, id: publicKey });
  const signedBuffer = nacl.sign.detached(Buffer.from(payload), Buffer.from(secretKey, "hex"));

  return { signature: Buffer.from(signedBuffer).toString("hex"), expirationTime, publicKey };
}

export function verify(signature: string, expiry: number, publicKey: string): Error | true {
  if (new Date().getTime() >= expiry) {
    return new Error("signature has expired");
  }

  const payload = JSON.stringify({ exp: expiry, id: publicKey });
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(payload),
    Buffer.from(signature, "hex"),
    Buffer.from(publicKey, "hex"),
  );

  if (!isVerified) {
    return new Error("invalid signature");
  }

  return true;
}

export function keyPair() {
  const { secretKey, publicKey } = nacl.sign.keyPair();
  return {
    secretKey: Buffer.from(secretKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  };
}
