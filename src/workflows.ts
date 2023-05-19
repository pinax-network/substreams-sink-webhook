import { proxyActivities } from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';

const { postWebhook } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function webhook(message: any): Promise<string> {
  return await postWebhook(message);
}
