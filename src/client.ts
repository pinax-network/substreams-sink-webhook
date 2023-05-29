import { nanoid } from 'nanoid';
import { webhook } from './workflows.js';
import { Client } from '@temporalio/client';
import { Clock } from "substreams"
import { logger } from 'substreams-sink';

export async function handleOperations(message: any, clock: Clock, moduleName: string, moduleHash: string, options: {url: string, privateKey: string}) {
  const client = new Client();
  const {signature, timestamp} = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: `post-${moduleName}-to-${options.url}-${nanoid()}`,
    args: [message, clock, moduleName, moduleHash, options.url, options.privateKey],
  });
  logger.info("POST", {moduleName, moduleHash, url: options.url, signature, timestamp});
}