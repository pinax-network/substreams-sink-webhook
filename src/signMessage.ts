import nacl from "tweetnacl";

export function signMessage(body: string, timestamp: number, secretKey: string) {
  const msg = Buffer.from(timestamp + body);
  const signed = nacl.sign.detached(msg, Buffer.from(secretKey, "hex"));
  return Buffer.from(signed).toString("hex");
}

export function keyPair() {
  const {secretKey, publicKey} = nacl.sign.keyPair();
  return {
    secretKey: Buffer.from(secretKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  };
}

export function generateSecretKey() {
  return keyPair().secretKey;
}

export function generatePublicKey(secretKey: string) {
  return nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey, "hex"))
}
