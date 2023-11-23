import { logger } from "substreams-sink";
import { Signer } from "./signer.js";

function awaitSetTimeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface PostWebhookOptions {
  maximumAttempts?: number;
}

export async function postWebhook(url: string, body: string, signer: Signer, options: PostWebhookOptions = {}) {
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
      const response = await fetch(url, {
        body,
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-signature-ed25519": signer.signature,
        },
      });

      const status = response.status;
      if (status !== 200) {
        attempts++;
        logger.warn(`Unexpected status code ${status}`, { url, body });
        continue;
      }
      return { url, status };
    } catch (e: any) {
      const error = e.cause;
      logger.error("Unexpected error", { url, body, error });
      attempts++;
    }
  }
}
