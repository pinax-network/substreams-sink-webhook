import "dotenv/config";
import express from "express";
import nacl from "tweetnacl";

const PORT = process.env.PORT ?? 3000;
const PUBLIC_KEY = process.env.PUBLIC_KEY ?? "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const app = express();

app.use(express.text({ type: "application/json" }));

app.use(async (req, res) => {
  // get headers and body from POST request
  const timestamp = req.headers["x-signature-timestamp"];
  const signature = req.headers["x-signature-ed25519"];
  const body = req.body;

  if (!timestamp) return res.send("missing required timestamp in headers").status(400);
  if (!signature) return res.send("missing required signature in headers").status(400);
  if (!body) return res.send("missing body").status(400);

  // validate signature using public key
  const isVerified = nacl.sign.detached.verify(
    Buffer.from(timestamp + body),
    Buffer.from(signature, "hex"),
    Buffer.from(PUBLIC_KEY, "hex"),
  );

  console.dir({ timestamp, signature, isVerified });
  console.dir(body);
  if (!isVerified) {
    return res.send("invalid request signature").status(401);
  }
  return res.send("OK").status(200);
});

app.listen(PORT, () => {
  console.log(`Listening on port http://localhost:${PORT}`);
  console.log(`Signature validation using ${PUBLIC_KEY}`);
});
