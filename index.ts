import { createModuleHash, getModuleOrThrow } from "@substreams/core";
import { createRegistry, createRequest, fetchSubstream } from "@substreams/core";
import { BlockEmitter, createDefaultTransport } from "@substreams/node";
import { nanoid } from "nanoid";
import type { RunOptions } from "substreams-sink";

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
  const token =
    options.substreamsApiToken ??
    process.env[options.substreamsApiTokenEnvvar || ""] ??
    process.env.SUBSTREAMS_API_TOKEN;
  const baseUrl = options.substreamsEndpoint ?? "https://mainnet.eth.streamingfast.io:443";
  if (!token) throw new Error("SUBSTREAMS_API_TOKEN is require");

  // Read Substream
  const substreamPackage = await fetchSubstream(manifest);
  if (!substreamPackage.modules) throw new Error("Unable to create Substream Package");

  // // Module hash
  // const module = getModuleOrThrow(substreamPackage.modules.modules, moduleName);
  // const moduleHash = Buffer.from(await createModuleHash(substreamPackage.modules, module)).toString("hex");

  // Connect Transport
  const registry = createRegistry(substreamPackage);
  const transport = createDefaultTransport(baseUrl, token, registry);
  const request = createRequest({
    substreamPackage,
    outputModule: moduleName,
    startBlockNum: options.startBlock as any,
    stopBlockNum: options.stopBlock as any,
    productionMode: true,
  });

  // NodeJS Events
  const emitter = new BlockEmitter(transport, request, registry);

  // Stream Blocks
  emitter.on("anyMessage", (message, state) => {
    const id = nanoid();
    console.dir(id);
    console.dir(message);
    console.dir(state.current);
  });

  emitter.start();
}
