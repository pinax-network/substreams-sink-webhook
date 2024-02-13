import "dotenv/config";
import express from "express";
import nacl from "tweetnacl";

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const app = express();

app.use(express.text({ type: "application/json" }));

app.use(async (request, res) => {
  // get headers and body from POST request
  const signature = String(request.headers["x-signature-ed25519"]);
  const timestamp = String(request.headers["x-signature-timestamp"]);
  const body = await request.body;

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
    return res.send("invalid request signature").status(401);
  }
  return res.send("OK").status(200);
});

app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
  console.log(`Signature validation using ${PUBLIC_KEY}`);
});
