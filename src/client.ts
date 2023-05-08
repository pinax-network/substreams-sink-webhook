import { nanoid } from 'nanoid';
import type { Clock } from "substreams";
import type { Client } from '@temporalio/client';
import { webhook } from './workflows.js';

export async function handleOperations(client: Client, message: any, clock: Clock, typeName: string, hash: string, manifest: string) {
  const result = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: 'workflow-' + nanoid(),
    args: [message, clock, typeName, hash, manifest],
  });
  console.log(result);
}
