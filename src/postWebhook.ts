import { Hex } from "@noble/curves/abstract/utils";
import { logger } from "substreams-sink";
import { createTimestamp, sign } from "./auth.js";
import logUpdate from "log-update";
import { Metadata } from "./schemas.js";

function awaitSetTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PostWebhookOptions {
  maximumAttempts?: number;
  disableSignature?: string;
}

function now() {
  return Math.floor(new Date().getTime() / 1000);
}

let blocks = 0;
const start = now();
// let lastUpdate = now();

// TO-DO replace with Prometheus metrics
function logProgress(metadata?: Metadata) {
  if (!metadata) return;
  const delta = now() - start;
  const rate = Math.round(blocks / delta);
  const minutes = Math.round(delta / 60);
  const seconds = delta % 60;
  if (blocks)
    logUpdate(`[app] timestamp=${metadata.clock.timestamp} block_number=${metadata.clock.number} blocks=${blocks} [${rate} b/s] (${minutes}m ${seconds}s)`);
  blocks++;
}

export async function postWebhook(url: string, body: string, metadata?: Metadata, secretKey?: Hex, options: PostWebhookOptions = {}) {
  // Retry Policy
  const initialInterval = 1000; // 1s
  const maximumAttempts = options.maximumAttempts ?? 100 * initialInterval;
  const maximumInterval = 100 * initialInterval;
  const backoffCoefficient = 2;

  let attempts = 0;
  while (true) {
    if (attempts > maximumAttempts && maximumAttempts === 0) {
      logger.error("invalid response", { url });
      throw new Error("invalid response");
    }

    if (attempts > maximumAttempts) {
      logger.error("Maximum attempts exceeded", { url });
      throw new Error("Maximum attempts exceeded");
    }

    if (attempts) {
      let milliseconds = initialInterval * backoffCoefficient ** attempts;
      if (milliseconds > maximumInterval) milliseconds = maximumInterval;
      logger.warn(`delay ${milliseconds}`, { attempts, url });
      await awaitSetTimeout(milliseconds);
    }

    try {
      const timestamp = createTimestamp();
      const headers = new Headers([
        ["content-type", "application/json"],
        ["x-signature-timestamp", String(timestamp)],
      ]);

      // optional signature
      if (secretKey) {
        headers.set("x-signature-ed25519", sign(timestamp, body, secretKey));
      }

      const response = await fetch(url, {
        body,
        method: "POST",
        headers,
      });

      const status = response.status;
      if (status !== 200) {
        attempts++;
        logger.warn(`Unexpected status code ${status}`, { url });
        continue;
      }
      // success
      logProgress(metadata);
      return { url, status };
    } catch (e: any) {
      const error = e.cause;
      logger.error("Unexpected error", { url, error });
      attempts++;
    }
  }
}
