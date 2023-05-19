import { nanoid } from 'nanoid';
import { webhook } from './workflows.js';
import { Client } from '@temporalio/client';

export async function handleOperations(message: any) {
  console.log("handleOperations", message);
  const client = new Client();
  const result = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: 'workflow-' + nanoid(),
    args: [message],
  });
  console.log(result);
}