import { Worker } from '@temporalio/worker';
import { URL, fileURLToPath } from 'url';
import * as path from 'node:path';
import * as activities from './activities.js';

// Support running both complied code and ts-node/esm loader
const workflowsPathUrl = new URL(`./workflows${path.extname(import.meta.url)}`, import.meta.url);

export async function createWorker( ) {
  const worker = await Worker.create({
    workflowsPath: fileURLToPath(workflowsPathUrl),
    activities,
    namespace: 'webhooks',
    taskQueue: 'WEBHOOK_TASK_QUEUE',
  });
  worker.run();
}

