import nacl from "tweetnacl";

const port = process.argv[2] ?? 3000
const PUBLIC_KEY = process.env.PUBLIC_KEY;
if ( !PUBLIC_KEY ) throw new Error("PUBLIC_KEY is require");
console.log(`Listening on port ${port}`);
console.log(`Signature validation using ${PUBLIC_KEY}`);

export default {
  port,
  async fetch(request) {
    // get headers and body from POST request
    const timestamp = request.headers.get("x-signature-timestamp");
    const signature = request.headers.get("x-signature-ed25519");
    const body = await request.text();

    if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
    if (!signature) return new Response("missing required signature in headers", { status: 400 });
    if (!body) return new Response("missing body", { status: 400 });

    // validate signature using public key
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(PUBLIC_KEY, 'hex')
    );
    console.log({isVerified, timestamp, signature});
    console.log(JSON.stringify(JSON.parse(body), null, 2));

    if (!isVerified) {
      return new Response("invalid request signature", { status: 401 });
    }
    return new Response("OK");
  },
};
