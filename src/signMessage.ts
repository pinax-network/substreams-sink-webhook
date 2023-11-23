import { logger } from "substreams-sink";
import nacl from "tweetnacl";

export function makeSignature(expirationTime: number, secretKey: string) {
  const id = secretKey.substring(nacl.sign.secretKeyLength);
  const payload = JSON.stringify({ exp: expirationTime, id });
  const signed = nacl.sign(Buffer.from(payload), Buffer.from(secretKey, "hex"));
  return Buffer.from(signed).toString("base64url");
}

export function verify(msg: Buffer, publicKey: string) {
  try {
    const signature = msg.subarray(0, nacl.sign.signatureLength);
    const payloadBuffer = msg.subarray(nacl.sign.signatureLength);
    const payload = JSON.parse(payloadBuffer.toString("utf-8"));

    if (new Date().getTime() >= payload.exp) {
      throw new Error("signature has expired");
    }

    if (publicKey !== payload.id) {
      throw new Error("invalid public key");
    }

    return nacl.sign.detached.verify(payloadBuffer, signature, Buffer.from(publicKey, "hex"));
  } catch (err) {
    logger.error(err);
    return false;
  }
}

export function keyPair() {
  const { secretKey, publicKey } = nacl.sign.keyPair();
  return {
    secretKey: Buffer.from(secretKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  };
}
