import nacl from "tweetnacl";

export function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function sign(timestamp: number, body: string, secretKey: string) {
  const secretKeyHex = Buffer.from(secretKey, "hex");

  // input validation
  if (secretKeyHex.length !== nacl.sign.secretKeyLength) {
    throw Error("invalid secret key length");
  }
  if (!body) {
    throw Error("missing body");
  }
  if (!(timestamp > 0)) {
    throw Error("invalid timestamp");
  }

  // sign message
  const msg = Buffer.from(timestamp + body);
  const signedBuffer = nacl.sign.detached(msg, secretKeyHex);
  return Buffer.from(signedBuffer).toString("hex");
}

export function verify(timestamp: number, body: string, signature: string, publicKey: string): true {
  const signatureHex = Buffer.from(signature, "hex");
  const publicKeyHex = Buffer.from(publicKey, "hex");

  // input validation
  if (signatureHex.length !== nacl.sign.signatureLength) {
    throw Error("invalid signature length");
  }
  if (!body) {
    throw Error("missing body");
  }
  if (!(timestamp > 0)) {
    throw Error("invalid timestamp");
  }
  if (publicKeyHex.length !== nacl.sign.publicKeyLength) {
    throw Error("invalid public key length");
  }

  // verify signature
  const msg = Buffer.from(timestamp + body);
  const isVerified = nacl.sign.detached.verify(msg, signatureHex, publicKeyHex);

  if (!isVerified) {
    throw Error("invalid signature");
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
