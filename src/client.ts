import { nanoid } from 'nanoid';
import { webhook } from './workflows.js';
import { Client } from '@temporalio/client';
import { Clock } from "substreams"
import { logger } from 'substreams-sink';
import { PrivateKey, Bytes } from "@wharfkit/session";

export async function handleOperations(message: any, clock: Clock, moduleName: string, url: string, privateKey: string) {
  // sign message
  const body = JSON.stringify({clock, moduleName, message});
  const timestamp = String(Math.floor(Date.now().valueOf() / 1000));
  const hex = Buffer.from(timestamp + body).toString("hex");
  const bytes = Bytes.from(hex);
  const key = PrivateKey.fromString(privateKey);
  const signature = key.signMessage(bytes).toString();

  // push result to Temporal
  const client = new Client();
  console.log("EXECUTE", {moduleName, url: url, signature, timestamp})
  const response = await client.workflow.execute(webhook, {
    taskQueue: 'webhooks',
    workflowId: `webhook-${moduleName}-to-${url}-${nanoid()}`,
    args: [url, body, signature, timestamp],
  });
  console.log("POST", {response});
}