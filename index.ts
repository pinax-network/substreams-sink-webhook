import PQueue from 'p-queue';
import { postWebhook } from "./src/postWebhook.js";
import { signMessage } from "./src/signMessage.js";
import { logger, setup, http } from "substreams-sink";

import type { WebhookRunOptions } from "./bin/cli.js";
import { ping } from "./src/ping.js";
import { banner } from './src/banner.js';
import { toText } from './src/http.js';
import type { SessionInit } from "@substreams/core/proto";

export async function action(options: WebhookRunOptions) {
  // Block Emitter
  const { emitter, moduleHash } = await setup(options);

  // Queue
  const queue = new PQueue({ concurrency: options.concurrency });

  // Ping URL to check if it's valid
  if (!options.disablePing) {
    if (!await ping(options.webhookUrl, options.secretKey)) {
      logger.error("exiting from invalid PING response");
      process.exit(1);
    }
  }
  let session: SessionInit;
  emitter.on("session", data => {
    session = data
  });

  // Stream Blocks
  emitter.on("anyMessage", async (data, cursor, clock) => {
    if (!clock.timestamp) return;
    const metadata = {
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
        moduleName: options.moduleName,
        moduleHash,
      },
    }
    // Sign body
    const seconds = Number(clock.timestamp.seconds);
    const body = JSON.stringify({ ...metadata, data });
    const signature = signMessage(seconds, body, options.secretKey);

    // Queue POST
    queue.add(async () => {
      const response = await postWebhook(options.webhookUrl, body, signature, seconds)
      logger.info("POST", response, metadata);
    });
  });
  emitter.start();
  http.listen(options);
  http.server.on("request", (req, res) => {
    if (req.url === "/") return toText(res, banner());
  })
}
