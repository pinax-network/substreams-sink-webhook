import http from "node:http";
import { Bytes, PublicKey, Signature  } from "@wharfkit/session"

export function createServer(options: { publicKey: string, port: number }) {
    const port = options.port ?? process.env.PORT ?? 8000;
    const publicKey = options.publicKey ?? process.env.PUBLIC_KEY;
    if ( !publicKey ) throw new Error("Missing required --public-key");

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

    server.on("request", async (request, response) => {
        response.writeHead(200, { "Content-Type": "text/plain" });
        const headers = request.headers;
        const timestamp = String(headers['x-signature-timestamp']);
        const signature = String(headers['x-signature-secp256k1']);

        if ( !timestamp || !signature ) {
            response.statusCode = 401;
            response.write("invalid request");
            response.end();
        }
        const body = await rawBody(request);
        const hex = Buffer.from(timestamp + body).toString("hex");
        const bytes = Bytes.from(hex);
        const isVerified = Signature.from(signature).verifyMessage(bytes, PublicKey.from(publicKey));

        console.log("\n---------MESSAGE---------");
        console.log("headers", JSON.stringify({timestamp, signature}, null, 2));
        console.log("body", JSON.stringify(JSON.parse(body), null, 2));

        if ( isVerified ) {
            response.write("OK");
        } else {
            response.statusCode = 401;
            response.write("invalid request signature");
        }
        response.end();
    });

    server.listen(options.port, () => {
        console.log(`server listening on http://localhost:${options.port}`);
    });
}
