import delay from "delay";
import { logger } from "./logger.js";
import { queue } from "./queue.js";

// Retry Policy
const initialInterval = 1000; // 1s
const backoffCoefficient = 2;
const maximumAttempts = Infinity;
const maximumInterval = 100 * initialInterval;

export async function postWebhook(url: string, body: string, signature: string, timestamp: number ) {
  let attempts = 0;
  while ( true ) {
    if ( attempts ) {
      let milliseconds = initialInterval * Math.pow(backoffCoefficient, attempts);
      if ( milliseconds > maximumInterval ) milliseconds = maximumInterval;
      logger.warn(`delay ${milliseconds}`, {attempts, url, queue: queue.size});
      await delay(milliseconds);
    }
    if ( attempts > maximumAttempts ) {
      logger.error("Maximum attempts exceeded", {url});
      throw new Error("Maximum attempts exceeded");
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
      return { text, attempts };
    } catch (e: any) {
      const error = e.cause;
      logger.error(`Unexpected error`, {url, error});
      attempts++;
    }
  }
}
