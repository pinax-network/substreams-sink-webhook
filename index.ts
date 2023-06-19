import "dotenv/config";
import fs from "node:fs";
// import { nanoid } from "nanoid";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import { createModuleHash, createRegistry, createRequest, fetchSubstream, getModuleOrThrow } from "@substreams/core";
import { getSubstreamsEndpoint } from "./src/getSubstreamsEndpoint.js";
import { postWebhook } from "./src/postWebhook.js";
import { signMessage } from "./src/signMessage.js";
import { getSubstreamsPackageURL } from "./src/getSubstreamsPackageURL.js";
import { logger } from "./src/logger.js";
import { queue } from "./src/queue.js";
import { ping } from "./src/ping.js";
import * as metrics from "./externals/prometheus.js";
import { applyParams } from "./externals/applyParams.js";
import { CONCURRENCY, CURSOR_FILE, PROMETHEUS_DISABLED, PROMETHEUS_HOSTNAME, PROMETHEUS_PORT, SECRET_KEY, WEBHOOK_URL, DISABLE_PING, SUBSTREAMS_API_TOKEN, SUBSTREAMS_API_TOKEN_ENVVAR } from "./src/config.js";
import type { WebhookRunOptions } from "./bin/cli.js";

export async function action(options: WebhookRunOptions) {
  // verbose
  const verbose = options.verbose ?? JSON.parse(process.env.VERBOSE ?? "false");
  if (verbose) {
    logger.settings.type = "pretty";
  }

  // Metrics
  const prometheusHostname = options.prometheusHostname ?? PROMETHEUS_HOSTNAME;
  const prometheusPort = options.prometheusPort ?? PROMETHEUS_PORT;
  const prometheusDisabled = options.prometheusDisabled ?? PROMETHEUS_DISABLED;

  // Queue
  const concurrency = options.concurrency ? parseInt(options.concurrency) : CONCURRENCY;
  queue.concurrency = concurrency;

  // Cursor file
  const cursorFile = options.cursorFile ?? CURSOR_FILE ?? "cursor.lock";
  const startCursor = fs.existsSync(cursorFile) ? fs.readFileSync(cursorFile, "utf-8") : "";

  // required CLI or environment variables
  const url = options.url ?? WEBHOOK_URL;
  if (!url) throw new Error("Missing required --url");

  // Private Key to sign messages
  const secretKey = options.secretKey ?? SECRET_KEY;
  if (!secretKey) throw new Error("Missing required --private-key");

  // Ping URL to check if it's valid
  const disablePing = options.disablePing ?? DISABLE_PING
  if ( !disablePing ) {
    if (!await ping(url, secretKey) ) {
      logger.error("exiting from invalid PING response");
      process.exit();
    }
  }

  // auth API token
  // https://app.streamingfast.io/
  const substreamsApiTokenEnvvar = options.substreamsApiTokenEnvvar ?? SUBSTREAMS_API_TOKEN_ENVVAR;
  const token = options.substreamsApiToken ?? SUBSTREAMS_API_TOKEN ?? process.env[substreamsApiTokenEnvvar || ""];
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
  const substreamPackage = await fetchSubstream(new Request(manifest));
  if (!substreamPackage.modules) throw new Error("Unable to create Substream Package");

  // Module hash
  const moduleName = options.moduleName ?? process.env.MODULE_NAME;
  if ( !moduleName ) throw new Error("Missing required --module-name");

  // Apply params
  const params = [];
  if ( options.params?.length ) params.push(...options.params)
  if ( process.env.PARAM) params.push(process.env.PARAM)
  if ( params.length ) applyParams(params, substreamPackage.modules.modules);
  logger.info("params", params);

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
    // const id = nanoid();
    const metadata = {
      // id,
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
    const signature = signMessage(seconds, body, secretKey);

    // Queue POST
    queue.add(async () => {
      const response = await postWebhook(url, body, signature, seconds)
      fs.writeFileSync(cursorFile, cursor, "utf-8");
      logger.info("POST", response, metadata);
    });
  });

  if ( !prometheusDisabled ) {
    emitter.on("block", block => {
      metrics.updateBlockDataMetrics(block);
      if ( block.clock ) metrics.updateClockMetrics(block.clock);
    });
    metrics.listen(prometheusPort, prometheusHostname);
  }

  // metrics.collectDefaultMetrics();
  logger.info("start BlockEmitter");
  emitter.start();
}
