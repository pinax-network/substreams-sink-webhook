import PQueue from "p-queue";
import { http, logger, setup } from "substreams-sink";
import { postWebhook } from "./src/postWebhook.js";

import type { SessionInit } from "@substreams/core/proto";
import type { WebhookRunOptions } from "./bin/cli.js";
import { banner } from "./src/banner.js";
import { toText } from "./src/http.js";
import { ping } from "./src/ping.js";

export * from "./src/auth/ed25519.js";
export * from "./src/schemas.js";

export async function action(options: WebhookRunOptions) {
  // Block Emitter
  const { emitter, moduleHash } = await setup(options);

  // Queue
  const queue = new PQueue({ concurrency: 1 }); // all messages are sent in block order, no need to parallelize

  // Ping URL to check if it's valid
  if (options.disablePing === "false") {
    if (!(await ping(options.webhookUrl, options.secretKey))) {
      logger.error("exiting from invalid PING response");
      process.exit(1);
    }
  }
  let session: SessionInit;
  emitter.on("session", (data) => {
    session = data;
  });

  // Stream Blocks
  emitter.on("output", async (data, cursor, clock) => {
    if (!clock.timestamp) return;
    const chain = new URL(options.substreamsEndpoint).hostname.split(".")[0];
    const metadata = {
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
        finalBlockOnly: options.finalBlocksOnly,
        moduleName: options.moduleName,
        type: data.getType().typeName,
        moduleHash,
      },
    };

    const body = JSON.stringify({ ...metadata, data });

    // Queue POST
    queue.add(async () => {
      const response = await postWebhook(options.webhookUrl, body, options.secretKey, options);
      logger.info("POST", response, metadata);
    });
  });
  emitter.start();

  // HTTP Server
  http.listen(options);
  http.server.on("request", (req, res) => {
    if (req.url === "/") return toText(res, banner());
  });

  emitter.on("close", () => {
    logger.info("stream closed");
    http.server.close()
  })
}
