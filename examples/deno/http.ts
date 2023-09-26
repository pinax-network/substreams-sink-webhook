import nacl from "npm:tweetnacl";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode } from "https://deno.land/std@0.190.0/encoding/hex.ts";
import "https://deno.land/std@0.190.0/dotenv/load.ts";

const PORT = Deno.env.get("PORT");
const PUBLIC_KEY = Deno.env.get("PUBLIC_KEY");

const handler = async (request: Request) => {
  // get headers and body from POST request
  const timestamp = request.headers.get("x-signature-timestamp");
  const signature = request.headers.get("x-signature-ed25519");
  const body = await request.text();

  if (!timestamp) return new Response("missing required timestamp in headers", { status: 400 });
  if (!signature) return new Response("missing required signature in headers", { status: 400 });
  if (!body) return new Response("missing body", { status: 400 });

  // TO-DO: 🚨 FIX CODE BELOW 🚨
  // validate signature using public key
  const isVerified = nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + body),
    encode(signature),
    encode(PUBLIC_KEY)
  );

  console.dir({timestamp, signature, isVerified});
  console.dir(body);
  if (!isVerified) {
    return new Response("invalid request signature", { status: 401 });
  }
  return new Response("OK");
};

serve(handler, { port: PORT });
console.log(`Signature validation using ${PUBLIC_KEY}`);
