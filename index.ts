import { RunOptions } from "./bin/substreams-sink.js";
import { createModuleHash, createRegistry, createRequest, fetchSubstream, getModuleOrThrow } from "@substreams/core";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import "dotenv/config";
import { nanoid } from "nanoid";

export interface ActionOptions extends RunOptions {
  url: string;
  privateKey: string;
}

export async function action(manifest: string, moduleName: string, options: ActionOptions) {
  // required CLI or environment variables
  const url = options.url ?? process.env.URL;
  const privateKey = options.privateKey ?? process.env.PRIVATE_KEY;
  if (!url) throw new Error("Missing required --url");
  if (!privateKey) throw new Error("Missing required --private-key");

  // auth API token
  // https://app.streamingfast.io/
  const token = options.substreamsApiToken ?? process.env[options.substreamsApiTokenEnvvar || ""] ?? process.env.SUBSTREAMS_API_TOKEN;
  const baseUrl = options.substreamsEndpoint;
  if (!token) throw new Error("SUBSTREAMS_API_TOKEN is require");

  // Read Substream
  const substreamPackage = await fetchSubstream(manifest);
  if (!substreamPackage.modules) throw new Error("Unable to create Substream Package");

  // Module hash
  const module = getModuleOrThrow(substreamPackage.modules.modules, moduleName);
  const moduleHash = Buffer.from(await createModuleHash(substreamPackage.modules, module)).toString("hex");

  const startBlockNum = options.startBlock ?? process.env.START_BLOCK;
  const stopBlockNum = options.stopBlock ?? process.env.STOP_BLOCK;
  if (!startBlockNum) throw new Error("Missing required --start-block");

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
  emitter.on("anyMessage", (message, state) => {
    const id = nanoid();
    const { current, timestamp, cursor } = state;
    console.dir({
      id,
      block_num: current,
      timestamp,
      endpoint: baseUrl,
      moduleHash,
      moduleName,
      params,
      cursor,
      message,
    });
  });

  emitter.start();
}
