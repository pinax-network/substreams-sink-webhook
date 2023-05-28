import { nanoid } from 'nanoid';
import { webhook } from './workflows.js';
import { Client } from '@temporalio/client';
import { Clock } from "substreams"

export async function handleOperations(message: any, clock: Clock, options: {url: string, privateKey: string}) {
  const client = new Client();
  const result = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: 'workflow-' + nanoid(),
    args: [message, clock, options.url, options.privateKey],
  });
  console.log({result});
}