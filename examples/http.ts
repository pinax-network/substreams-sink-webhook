import { Bytes, PublicKey, Signature } from "@wharfkit/session";

const port = process.argv[2] ?? 3000
const PUBLIC_KEY = process.env.PUBLIC_KEY;
if ( !PUBLIC_KEY ) throw new Error("PUBLIC_KEY is require");
console.log(`Listening on port ${port}`);
console.log(`Signature validation using ${PUBLIC_KEY}`);

export default {
  port,
  development: true,
  async fetch(request) {
    // get headers and body from POST request
    const timestamp = request.headers.get("x-signature-timestamp");
    const signature = request.headers.get("x-signature-secp256k1");
    const body = await request.text();

    if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
    if (!signature) return new Response("missing required signature in headers", { status: 400 });
    if (!body) return new Response("missing body", { status: 400 });

    // validate signature using public key
    const publicKey = PublicKey.from(PUBLIC_KEY);
    const message = Bytes.from(Buffer.from(timestamp + body).toString("hex"));
    const isVerified = Signature.from(signature).verifyMessage(message, publicKey);
    console.log({isVerified, timestamp, signature});
    console.log(body);

    if (!isVerified) {
      return new Response("invalid request signature", { status: 401 });
    }
    return new Response("OK");
  },
};
