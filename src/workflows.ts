import { Clock } from "substreams";
import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';

const { postWebhook } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export function webhook(message: any, clock: Clock, url: string, privateKey: string) {
  return postWebhook(message, clock, url, privateKey);
}
