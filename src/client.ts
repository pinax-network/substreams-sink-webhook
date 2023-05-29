import { nanoid } from 'nanoid';
import { webhook } from './workflows.js';
import { Client } from '@temporalio/client';
import { Clock } from "substreams"
import { logger } from 'substreams-sink';

export async function handleOperations(message: any, clock: Clock, options: {url: string, privateKey: string}) {
  const client = new Client();
  const {signature, timestamp} = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: `workflow-${clock.number}-${nanoid()}`,
    args: [message, clock, options.url, options.privateKey],
  });
  logger.info("POST", {url: options.url, signature, timestamp});
}