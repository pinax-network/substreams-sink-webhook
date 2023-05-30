import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';

const { postWebhook } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export function webhook(url: string, body: string, signature: string, timestamp: string) {
  return postWebhook(url, body, signature, timestamp);
}
