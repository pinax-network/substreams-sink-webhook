import { createHash, download } from "substreams";
import { run, logger } from "substreams-sink";
import type { RunOptions } from "substreams-sink";
import { Client } from '@temporalio/client';
import pkg from "./package.json";
import { handleOperations } from "./src/client.js";

logger.defaultMeta = { service: pkg.name };
export { logger };

export interface ActionOptions extends RunOptions {
    taskQueue: string;
    workflowId: string;
    args: string[];
}

export function handleLabels(value: string, previous: {}) {
    const params = new URLSearchParams(value);
    return { ...previous, ...Object.fromEntries(params) };
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // Download Substreams (or read from local file system)
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", {manifest, hash});

    // Run Substreams
    const substreams = run(spkg, moduleName, options);
    substreams.on("anyMessage", handleOperations)
    substreams.start(options.delayBeforeStart);
}