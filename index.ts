import { createHash, download } from "substreams";
import { run, logger } from "substreams-sink";
import type { RunOptions } from "substreams-sink";
import pkg from "./package.json";
import { handleOperations } from "./src/client.js";
import { createWorker } from "./src/worker.js"

logger.defaultMeta = { service: pkg.name };
export { logger };

export interface ActionOptions extends RunOptions {
    url: string;
    privateKey: string;
}

export function handleLabels(value: string, previous: {}) {
    const params = new URLSearchParams(value);
    return { ...previous, ...Object.fromEntries(params) };
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
    // required
    if ( !options.url ) throw new Error("Missing required --url");
    if ( !options.privateKey ) throw new Error("Missing required --private-key");

    // Download Substreams (or read from local file system)
    const spkg = await download(manifest);
    const hash = createHash(spkg);
    logger.info("download", {manifest, hash});

    // create Temporal Worker
    createWorker();

    // Run Substreams
    const substreams = run(spkg, moduleName, options);
    substreams.on("anyMessage", (message, clock) => handleOperations(message, clock, options))
    substreams.start();
}