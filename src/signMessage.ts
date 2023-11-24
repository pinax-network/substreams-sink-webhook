import nacl from "tweetnacl";

export function keyPair() {
  const { secretKey, publicKey } = nacl.sign.keyPair();
  return {
    secretKey: Buffer.from(secretKey).toString("hex"),
    publicKey: Buffer.from(publicKey).toString("hex"),
  };
}
