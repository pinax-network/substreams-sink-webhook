import { RunOptions } from "./bin/substreams-sink.js";
import { getSubstreamsEndpoint } from "./src/getSubstreamsEndpoint.js";
import { generateTimestampSeconds } from "./src/generateTimestampSeconds.js";
import { postWebhook } from "./src/postWebhook.js";
import { signMessage } from "./src/signMessage.js";
import { createModuleHash, createRegistry, createRequest, fetchSubstream, getModuleOrThrow } from "@substreams/core";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import { nanoid } from "nanoid";
import "dotenv/config";
import { getSubstreamsPackageURL } from "./src/getSubstreamsPackageURL.js";
import { Logger, ILogObj } from "tslog";

export interface ActionOptions extends RunOptions {
  url: string;
  privateKey: string;
}

const log: Logger<ILogObj> = new Logger();

export async function action(options: ActionOptions) {
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
  const module = getModuleOrThrow(substreamPackage.modules.modules, moduleName);
  const moduleHash = Buffer.from(await createModuleHash(substreamPackage.modules, module)).toString("hex");

  const startBlockNum = options.startBlock ?? process.env.START_BLOCK;
  const stopBlockNum = options.stopBlock ?? process.env.STOP_BLOCK;
  if (!startBlockNum) throw new Error("Missing required --start-block");

  // TO-DO
  const params = options.params;

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

  // NodeJS Events
  const emitter = new BlockEmitter(transport, request, registry);

  // Stream Blocks
  emitter.on("anyMessage", async (data, state) => {
    const id = nanoid();
    if (!state.timestamp) return;
    const timestamp = generateTimestampSeconds(state.timestamp);
    const body = JSON.stringify({
      id,
      chain,
      moduleName,
      moduleHash,
      block_num: Number(state.current),
      timestamp: state.timestamp.toISOString(),
      cursor: state.cursor,
      data,
    });
    const signature = signMessage(body, timestamp, privateKey);
    const response = await postWebhook(url, body, signature, timestamp);
    if ( options.verbose) log.info("POST", {moduleName, moduleHash,id, response});
  });

  emitter.start();
}
