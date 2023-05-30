import { Worker } from '@temporalio/worker';
import * as activities from './activities.js';

export async function createWorker( ) {
  const worker = await Worker.create({
    workflowsPath: require.resolve('./workflows'),
    activities,
    taskQueue: 'webhooks',
  })
  worker.run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

