import "dotenv/config";
import * as http from "node:http";
import nacl from "tweetnacl";

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const server = http.createServer();

function rawBody(request: http.IncomingMessage) {
  return new Promise<string>((resolve) => {
    const chunks: Uint8Array[] = [];
    request
      .on("data", (chunk) => {
        chunks.push(chunk);
      })
      .on("end", () => {
        resolve(Buffer.concat(chunks).toString());
      });
  });
}

// Create a local server to serve Prometheus gauges
server.on("request", async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

  // get headers and body from POST request
  const signature = String(req.headers["x-signature-ed25519"]);
  const expiry = String(req.headers["x-signature-ed25519-expiry"]);
  const publicKey = String(req.headers["x-signature-ed25519-public-key"]);

  const body = await rawBody(req);

  if (!signature) return new Response("missing required signature in headers", { status: 400 });
  if (!expiry) return new Response("missing required expiry in headers", { status: 400 });
  if (!publicKey) return new Response("missing required public key in headers", { status: 400 });
  if (!body) return new Response("missing body", { status: 400 });

  if (new Date().getTime() >= Number(expiry)) return new Response("signature expired", { status: 401 });
  if (publicKey !== PUBLIC_KEY) return new Response("unknown public key", { status: 401 });

  // validate signature using public key
  const payload = JSON.stringify({ exp: expiry, id: publicKey });
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(payload),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex")
  );

  console.dir({ signature, isVerified });
  console.dir(body);
  if (!isVerified) {
    return res.writeHead(401).end("invalid request signature");
  }
  return res.end("OK");
});

server.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
  console.log(`Signature validation using ${PUBLIC_KEY}`);
});
