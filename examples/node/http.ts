import nacl from "tweetnacl";
import * as http from "node:http";
import "dotenv/config";

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const server = http.createServer();

function rawBody(request: http.IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
      let chunks: Uint8Array[] = [];
      request.on('data', (chunk) => {
          chunks.push(chunk);
      }).on('end', () => {
          resolve(Buffer.concat(chunks).toString());
      });
  });
}

// Create a local server to serve Prometheus gauges
server.on("request", async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

  // get headers and body from POST request
  const timestamp = String(req.headers["x-signature-timestamp"]);
  const signature = String(req.headers["x-signature-ed25519"]);
  const body = await rawBody(req);

  if (!timestamp) return res.writeHead(400).end("missing required timestamp in headers");
  if (!signature) return res.writeHead(400).end("missing required signature in headers");
  if (!body) return res.writeHead(400).end("missing body");

  // validate signature using public key
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, 'hex'),
    Buffer.from(PUBLIC_KEY, 'hex')
  );

  console.dir({timestamp, signature, isVerified});
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
