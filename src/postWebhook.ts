import delay from "delay";
import { logger } from "./logger.js";
import { queue } from "./queue.js";

interface PostWebhookOptions {
  maximumAttempts?: number;
}

export async function postWebhook(url: string, body: string, signature: string, timestamp: number, options: PostWebhookOptions = {}) {
  // Retry Policy
  const initialInterval = 1000; // 1s
  const maximumAttempts = options.maximumAttempts ?? 100 * initialInterval;
  const maximumInterval = 100 * initialInterval;
  const backoffCoefficient = 2;

  let attempts = 0;
  while ( true ) {
    if ( attempts > maximumAttempts && maximumAttempts == 0 ) {
      logger.error("invalid response", {url});
      throw new Error("invalid response");
    }
    if ( attempts > maximumAttempts ) {
      logger.error("Maximum attempts exceeded", {url});
      throw new Error("Maximum attempts exceeded");
    }
    if ( attempts ) {
      let milliseconds = initialInterval * Math.pow(backoffCoefficient, attempts);
      if ( milliseconds > maximumInterval ) milliseconds = maximumInterval;
      logger.warn(`delay ${milliseconds}`, {attempts, url, queue: queue.size});
      await delay(milliseconds);
    }
    try {
      const response = await fetch(url, {
        body,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-signature-secp256k1": signature,
          "x-signature-timestamp": String(timestamp),
        },
      })
      const status = response.status;
      const text = await response.text();
      if ( status != 200 ) {
        attempts++;
        logger.warn(`Unexpected status code ${status}`, { text, url });
        continue;
      }
      return {url, status, text};
    } catch (e: any) {
      const error = e.cause;
      logger.error(`Unexpected error`, {url, error});
      attempts++;
    }
  }
}
