import "https://deno.land/std@0.190.0/dotenv/load.ts";
import { encode } from "https://deno.land/std@0.190.0/encoding/hex.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import nacl from "npm:tweetnacl";

const PORT = Deno.env.get("PORT");
const PUBLIC_KEY = Deno.env.get("PUBLIC_KEY");

const handler = async (request: Request) => {
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

  // TO-DO: 🚨 FIX CODE BELOW 🚨
  // validate signature using public key
  const isVerified = nacl.sign.detached.verify(encode(body), encode(signature), encode(PUBLIC_KEY));

  console.dir({ signature, isVerified });
  console.dir(body);
  if (!isVerified) {
    return new Response("invalid request signature", { status: 401 });
  }
  return new Response("OK");
};

serve(handler, { port: PORT });
console.log(`Signature validation using ${PUBLIC_KEY}`);
