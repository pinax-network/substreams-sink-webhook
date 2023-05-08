import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';
import type { Clock } from "substreams";

const { postWebhook } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function webhook(message: any, clock: Clock, typeName: string, hash: string, manifest: string): Promise<string> {
  return await postWebhook(message, clock, typeName, hash, manifest);
}
