import PQueue from 'p-queue';
export const queue: PQueue = new PQueue({concurrency: 1});