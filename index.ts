import "dotenv/config";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import { createModuleHash, createRegistry, createRequest, fetchSubstream, getModuleOrThrow } from "@substreams/core";
import { type RunOptions } from "./externals/substreams-sink.js";
import { getSubstreamsEndpoint } from "./src/getSubstreamsEndpoint.js";
import { postWebhook } from "./src/postWebhook.js";
import { signMessage } from "./src/signMessage.js";
import { getSubstreamsPackageURL } from "./src/getSubstreamsPackageURL.js";
import { logger } from "./src/logger.js";
import { queue } from "./src/queue.js";
import { PrivateKey } from "@wharfkit/session";
import { ping } from "./src/ping.js";
import * as metrics from "./externals/prometheus.js";
import { applyParams } from "./externals/applyParams.js";

export interface ActionOptions extends RunOptions {
  url: string;
  privateKey: string;
  concurrency: string;
}

export async function action(options: ActionOptions) {
  // verbose
  const verbose = options.verbose ?? JSON.parse(process.env.VERBOSE ?? "false");
  if (verbose) logger.settings.type = "pretty";

  // Queue
  queue.concurrency = parseInt(options.concurrency) ?? process.env.CONCURRENCY ?? 1;

  // Cursor file
  const cursorFile = options.cursorFile ?? process.env.CURSOR_FILE ?? "cursor.lock";
  const startCursor = fs.existsSync(cursorFile) ? fs.readFileSync(cursorFile, "utf-8") : "";

  // required CLI or environment variables
  const url = options.url ?? process.env.URL;
  if (!url) throw new Error("Missing required --url");

  // Private Key to sign messages
  if (!options.privateKey && !process.env.PRIVATE_KEY) throw new Error("Missing required --private-key");
  const privateKey = PrivateKey.fromString(options.privateKey ?? process.env.PRIVATE_KEY);

  // Ping URL to check if it's valid
  if (!await ping(url, privateKey) ) {
    logger.error("exiting from invalid PING response");
    process.exit();
  }

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
  logger.info("fetching manifest", {manifest});
  const substreamPackage = await fetchSubstream(manifest);
  if (!substreamPackage.modules) throw new Error("Unable to create Substream Package");

  // Module hash
  const moduleName = options.moduleName ?? process.env.MODULE_NAME;
  if ( !moduleName ) throw new Error("Missing required --module-name");

  // Apply params
  const params = [];
  if ( options.params.length ) params.push(...options.params)
  if ( process.env.PARAM) params.push(`${moduleName}=${process.env.PARAM}`)
  const modules = substreamPackage.modules.modules;
  if ( params.length ) applyParams(params, modules);

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
    startCursor,
  });

  // Block Emitter
  const emitter = new BlockEmitter(transport, request, registry);

  // Stream Blocks
  emitter.on("anyMessage", async (data, cursor, clock) => {
    if ( !clock.timestamp ) return;
    const id = nanoid();
    const metadata = {
      id,
      cursor,
      clock: {
        timestamp: clock.timestamp.toDate().toISOString(),
        number: Number(clock.number),
        id: clock.id,
      },
      manifest: {
        chain,
        moduleName,
        moduleHash,
      },
    }
    // Sign body
    const seconds = Number(clock.timestamp.seconds);
    const body = JSON.stringify({...metadata, data});
    const signature = signMessage(body, seconds, privateKey);

    // Queue POST
    queue.add(async () => {
      const response = await postWebhook(url, body, signature, seconds)
      fs.writeFileSync(cursorFile, cursor, "utf-8");
      logger.info("POST", response, metadata);
    });
  });

  emitter.on("block", block => {
    metrics.updateBlockDataMetrics(block);
    if ( block.clock ) metrics.updateClockMetrics(block.clock);
  });

  metrics.listen(9102, "localhost");
  // metrics.collectDefaultMetrics();
  logger.info("start BlockEmitter");
  emitter.start();
}
