import "dotenv/config";
import nacl from "tweetnacl";

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";

console.dir(`Listening on port http://localhost:${PORT}`);
console.log(`Signature validation using ${PUBLIC_KEY}`);

export default {
  port: PORT,
  async fetch(request) {
    // get headers and body from POST request
    const signature = request.headers.get("x-signature-ed25519");
    const expiry = request.headers.get("x-signature-ed25519-expiry");
    const publicKey = request.headers.get("x-signature-ed25519-public-key");

    const body = await request.text();

    if (!signature) return new Response("missing required signature in headers", { status: 400 });
    if (!expiry) return new Response("missing required expiry in headers", { status: 400 });
    if (!publicKey) return new Response("missing required public key in headers", { status: 400 });
    if (!body) return new Response("missing body", { status: 400 });

    if (publicKey !== PUBLIC_KEY) return new Response("unknown public key", { status: 401 });

    // validate signature using public key
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(body),
      Buffer.from(signature, "hex"),
      Buffer.from(publicKey, "hex")
    );
    console.log({ isVerified, signature });
    console.log(body);

    if (!isVerified) {
      return new Response("invalid request signature", { status: 401 });
    }
    return new Response("OK");
  },
};
