import { RunOptions } from "./bin/substreams-sink.js";
import { getSubstreamsEndpoint } from "./src/getSubstreamsEndpoint.js";
import { generateTimestampSeconds } from "./src/generateTimestampSeconds.js";
import { postWebhook } from "./src/postWebhook.js";
import { signMessage } from "./src/signMessage.js";
import { applyParams, createModuleHash, createRegistry, createRequest, fetchSubstream, getModuleOrThrow } from "@substreams/core";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import { nanoid } from "nanoid";
import "dotenv/config";
import { getSubstreamsPackageURL } from "./src/getSubstreamsPackageURL.js";
import { logger } from "./src/logger.js";
import { queue } from "./src/queue.js";


export interface ActionOptions extends RunOptions {
  url: string;
  privateKey: string;
  concurrency: string;
}

export async function action(options: ActionOptions) {
  // verbose
  if (!options.verbose) logger.settings.type = "hidden";

  // Queue
  queue.concurrency = parseInt(options.concurrency) ?? process.env.CONCURRENCY ?? 1;

  // required CLI or environment variables
  const url = options.url ?? process.env.URL;
  const privateKey = options.privateKey ?? process.env.PRIVATE_KEY;
  if (!url) throw new Error("Missing required --url");
  if (!privateKey) throw new Error("Missing required --private-key");

  // auth API token
  // https://app.streamingfast.io/
  const token = options.substreamsApiToken ?? process.env[options.substreamsApiTokenEnvvar || ""] ?? process.env.SUBSTREAMS_API_TOKEN;
  if (!token) throw new Error("SUBSTREAMS_API_TOKEN is require");
  let baseUrl = options.substreamsEndpoint ?? process.env.SUBSTREAMS_ENDPOINT;
  const chain = options.chain ?? process.env.CHAIN;
  if ( !baseUrl ) {
    if (!chain) throw new Error("CHAIN or SUBSTREAMS_ENDPOINT is require");
    baseUrl = getSubstreamsEndpoint(chain);
  }

  // Read Substream
  const spkg = options.spkg ?? process.env.SPKG;
  const manifest = spkg ? getSubstreamsPackageURL(spkg) : options.manifest ?? process.env.MANIFEST;
  if (!manifest) throw new Error("Missing required --manifest or --spkg");
  const substreamPackage = await fetchSubstream(manifest);
  if (!substreamPackage.modules) throw new Error("Unable to create Substream Package");

  // Module hash
  const moduleName = options.moduleName ?? process.env.MODULE_NAME;
  if ( !moduleName ) throw new Error("Missing required --module-name");

  // Apply params
  applyParams(options.params, substreamPackage.modules.modules);

  // Module hash
  const module = getModuleOrThrow(substreamPackage.modules.modules, moduleName);
  const moduleHash = Buffer.from(await createModuleHash(substreamPackage.modules, module)).toString("hex");

  // Start & Stop block
  const startBlockNum = options.startBlock ?? process.env.START_BLOCK;
  const stopBlockNum = options.stopBlock ?? process.env.STOP_BLOCK;
  if (!startBlockNum) throw new Error("Missing required --start-block");

  // Connect Transport
  const registry = createRegistry(substreamPackage);
  const transport = createDefaultTransport(baseUrl, token, registry);
  const request = createRequest({
    substreamPackage,
    outputModule: moduleName,
    startBlockNum: startBlockNum as any,
    stopBlockNum: stopBlockNum as any,
    productionMode: true,
  });

  // Block Emitter
  const emitter = new BlockEmitter(transport, request, registry);

  // Stream Blocks
  emitter.on("anyMessage", async (data, state) => {
    const id = nanoid();
    if (!state.timestamp) return;
    const timestamp = generateTimestampSeconds(state.timestamp);
    const block_num = Number(state.current);
    const body = JSON.stringify({
      id,
      chain,
      moduleName,
      moduleHash,
      block_num,
      timestamp: state.timestamp.toISOString(),
      cursor: state.cursor,
      data,
    });
    // Sign body
    const signature = signMessage(body, timestamp, privateKey);

    // Queue POST
    queue.add(async () => {
      const {response, attempts} = await postWebhook(url, body, signature, timestamp)
      logger.info("POST", {url, response, attempts, id, chain, spkg, manifest, baseUrl, block_num, moduleName, moduleHash, cursor: state.cursor});
    });
  });

  emitter.start();
}
