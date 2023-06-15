import nacl from "tweetnacl";

export function signMessage(timestamp: number, body: string, secretKey: string) {
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

export function fromSecretKey(secretKey: string) {
  const from = nacl.sign.keyPair.fromSecretKey(Buffer.from(secretKey, "hex"))
  return {
    secretKey: Buffer.from(from.secretKey).toString("hex"),
    publicKey: Buffer.from(from.publicKey).toString("hex"),
  };
}

export function verify(msg: Buffer, sig: string, publicKey: string) {
  return nacl.sign.detached.verify(
    msg,
    Buffer.from(sig, "hex"),
    Buffer.from(publicKey, "hex")
  );
}
