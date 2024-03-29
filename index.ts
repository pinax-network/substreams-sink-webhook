import PQueue from "p-queue";
import fs from "fs";
import { http, setup, logger, fileCursor } from "substreams-sink";
import { postWebhook } from "./src/postWebhook.js";

import type { SessionInit } from "@substreams/core/proto";
import type { WebhookRunOptions } from "./bin/cli.js";
import { banner } from "./src/banner.js";
import { toJSON, toText } from "./src/http.js";
import { ping } from "./src/ping.js";
import { keyPair, parsePrivateKey } from "./src/auth.js";
import { Metadata, boolean } from "./src/schemas.js";

export async function action(options: WebhookRunOptions) {
  const cursor = fileCursor.readCursor(options.cursorPath);
  const finalBlocksOnly = boolean.parse(options.finalBlocksOnly);

  // Block Emitter
  const { emitter, moduleHash } = await setup({ ...options, cursor });

  // Queue
  const queue = new PQueue({ concurrency: 1 }); // all messages are sent in block order, no need to parallelize

  // Ping URL to check if it's valid
  const privateKey = parsePrivateKey(options.privateKey);
  if (!(await ping(options.webhookUrl, privateKey))) {
    logger.error("exiting from invalid PING response");
    process.exit(1);
  }
  let session: SessionInit;
  emitter.on("session", (data) => {
    session = data;
  });

  // Stream Blocks
  emitter.on("output", async (data, cursor, clock) => {
    if (!clock.timestamp) return;
    const chain = new URL(options.substreamsEndpoint).hostname.split(".")[0];
    const metadata: Metadata = {
      status: 200,
      cursor,
      session: {
        traceId: session.traceId,
        resolvedStartBlock: Number(session.resolvedStartBlock),
      },
      clock: {
        timestamp: clock.timestamp.toDate().toISOString(),
        number: Number(clock.number),
        id: clock.id,
      },
      manifest: {
        substreamsEndpoint: options.substreamsEndpoint,
        chain,
        finalBlocksOnly,
        moduleName: options.moduleName,
        type: data.getType().typeName,
        moduleHash,
      },
    };

    const body = JSON.stringify({ ...metadata, data });

    // Queue POST
    queue.add(async () => {
      await postWebhook(options.webhookUrl, body, metadata, privateKey, options);
      fs.writeFileSync(options.cursorPath, cursor);
    });
  });
  emitter.start();

  // HTTP Server
  http.listen(options);
  http.server.on("request", (req, res) => {
    if (req.url === "/") return toText(res, banner());
    if (req.url === "/keypair") return toJSON(res, keyPair());
  });

  emitter.on("close", () => {
    logger.info("stream closed");
    http.server.close();
  });
}
