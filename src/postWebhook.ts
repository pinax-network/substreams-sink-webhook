import delay from "delay";
import { log } from "../index.js";

// Retry Policy
const initialInterval = 1000; // 1s
const backoffCoefficient = 2;
const maximumAttempts = Infinity;
const maximumInterval = 100 * initialInterval;

export async function postWebhook(url: string, body: string, signature: string, timestamp: number ) {
  let attempts = 1;
  if ( attempts ) {
    let milliseconds = initialInterval * Math.pow(backoffCoefficient, attempts);
    if ( milliseconds > maximumInterval ) milliseconds = maximumInterval;
    await delay(milliseconds);
  }
  if ( attempts > maximumAttempts ) {
    log.error("Maximum attempts exceeded", {url, body, signature, timestamp});
    throw new Error("Maximum attempts exceeded");
  }
  while ( true ) {
    try {
      const response = await fetch(url, {
        body,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-signature-secp256k1": signature,
          "x-signature-timestamp": String(timestamp),
        },
      });
      if ( response.status != 200 ) throw new Error(`Unexpected status code ${response.status}`);
      return { response: await response.text(), attempts };
    } catch (e) {
      attempts++;
    }
  }
}
