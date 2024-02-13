import { Hex } from "@noble/curves/abstract/utils";
import { ed25519 } from "@noble/curves/ed25519";

export function createTimestamp() {
  return Math.floor(Date.now() / 1000);
}

export function createMessage(timestamp: number, body: Hex): Hex {
  return Buffer.from(`${timestamp}${body}`);
}

export function checkKey(key: Hex, type: "public" | "private") {
  const length = typeof key === "string" ? 64 : 32;
  if (key.length !== length) {
    throw Error(`invalid ${type} key length`);
  }
}

export function checkSignature(signature: Hex) {
  const length = typeof signature === "string" ? 128 : 64;
  if (signature.length !== length) {
    throw Error("invalid signature length");
  }
}

export function checkMessage(timestamp: number, body: string) {
  if (!body) {
    throw Error("missing body");
  }
  if (!(timestamp > 0)) {
    throw Error("invalid timestamp");
  }
}

export function toHex(arrayBuffer: Uint8Array) {
  return Buffer.from(arrayBuffer).toString("hex");
}

export function sign(timestamp: number, body: string, privateKey: Hex) {
  checkKey(privateKey, "private");
  checkMessage(timestamp, body);
  const message = createMessage(timestamp, body);
  const signedBuffer = ed25519.sign(message, privateKey);
  return Buffer.from(signedBuffer).toString("hex");
}

export function verify(timestamp: number, body: string, signature: Hex, publicKey: Hex): true {
  checkKey(publicKey, "public");
  checkMessage(timestamp, body);
  checkSignature(signature);
  const message = createMessage(timestamp, body);
  const isVerified = ed25519.verify(signature, message, publicKey);

  if (!isVerified) {
    throw Error("invalid signature");
  }
  return true;
}

export function keyPair() {
  const privateKey = ed25519.utils.randomPrivateKey();
  const publicKey = ed25519.getPublicKey(privateKey);
  return {
    privateKey: Buffer.from(privateKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  };
}
