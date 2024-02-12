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
  // get headers and body from POST request
  const signature = String(req.headers["x-signature-ed25519"]);
  const timestamp = Number(req.headers["x-signature-timestamp"]);
  const body = await rawBody(req);

  if (!signature) return new Response("missing required signature in headers", { status: 400 });
  if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
  if (!body) return new Response("missing body", { status: 400 });

  // validate signature using public key
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex"),
  );

  console.dir({ signature, timestamp, isVerified });
  console.dir(body);
  res.setHeader("Content-Type", "text/plain;charset=utf-8");
  if (!isVerified) {
    return res.writeHead(401).end("invalid request signature");
  }
  return res.writeHead(200).end("OK");
});

server.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
  console.log(`Signature validation using ${PUBLIC_KEY}`);
});
