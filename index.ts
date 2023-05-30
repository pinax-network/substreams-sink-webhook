import { run, logger } from "substreams-sink";
import type { RunOptions } from "substreams-sink";
import { fetchSubstream, createModuleHash, getModuleOrThrow } from "@substreams/core"
import pkg from "./package.json";
import { handleOperations } from "./src/client.js";

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
    // required CLI or environment variables
    const url = options.url ?? process.env.URL;
    const privateKey = options.privateKey ?? process.env.PRIVATE_KEY;
    if ( !url ) throw new Error("Missing required --url");
    if ( !privateKey ) throw new Error("Missing required --private-key");

    // Download Substreams (or read from local file system)
    const spkg = await fetchSubstream(manifest);
    if ( !spkg.modules ) throw new Error("Unable to create Substream Package");
    const module = getModuleOrThrow(spkg.modules, moduleName);
    const moduleHash = Buffer.from(await createModuleHash(spkg.modules, module)).toString("hex");

    // Run Substreams
    const substreams = run(spkg.toBinary(), moduleName, options);
    substreams.on("anyMessage", (message, clock) => handleOperations(message, clock, moduleName, moduleHash, url, privateKey))
    substreams.start();
}