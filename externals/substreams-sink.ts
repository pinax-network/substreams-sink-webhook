import { Command } from "commander";

export interface RunOptions {
  startBlock?: string;
  stopBlock?: string;
  substreamsEndpoint?: string;
  manifest?: string;
  spkg?: string;
  substreamsApiTokenEnvvar?: string;
  substreamsApiToken?: string;
  delayBeforeStart?: string;
  cursorFile?: string;
  productionMode?: boolean;
  verbose?: boolean;
  prometheusHostname?: string;
  prometheusPort?: number;
  prometheusDisabled?: boolean;
  chain?: string;
  params: string[];
  moduleName?: string;
}

// defaults
export const DEFAULT_HOSTNAME = "127.0.0.1";
export const DEFAULT_PROMETHEUS_PORT = 9102;
export const DEFAULT_PROMETHEUS_HOSTNAME = DEFAULT_HOSTNAME;
export const DEFAULT_PROMETHEUS_DISABLED = false;
export const DEFAULT_VERBOSE = false;
export const DEFAULT_SUBSTREAMS_API_TOKEN_ENV = "SUBSTREAMS_API_TOKEN";
export const DEFAULT_CURSOR_FILE = "cursor.lock";
export const DEFAULT_PRODUCTION_MODE = false;

interface Package {
  name: string;
  version: string;
  description: string;
}

export function program(pkg: Package) {
  const program = new Command();
  program.name(pkg.name).version(pkg.version, "-v, --version", `version for ${pkg.name}`);
  program.command("completion").description("Generate the autocompletion script for the specified shell");
  program.command("help").description("Display help for command");
  program.showHelpAfterError();
  return program;
}

export function option(program: Command, pkg: Package) {
  return program
    .showHelpAfterError()
    .description(pkg.description)
    .option("-e --substreams-endpoint <string>", "Substreams gRPC endpoint to stream data from")
    .option("--manifest", "URL of Substreams package")
    .option("--spkg", "Substreams package (ex: eosio.token)")
    .option("--module_name", "Name of the output module (declared in the manifest)")
    .option("--chain <string>", "Substreams supported chain (ex: eth)")
    .option("-s --start-block <int>", "Start block to stream from (defaults to -1, which means the initialBlock of the first module you are streaming)")
    .option("-t --stop-block <string>", "Stop block to end stream at, inclusively")
    .option("--substreams-api-token <string>", "API token for the substream endpoint")
    .option("--substreams-api-token-envvar <string>", "Environnement variable name of the API token for the substream endpoint", DEFAULT_SUBSTREAMS_API_TOKEN_ENV)
    .option("--delay-before-start <int>", "[OPERATOR] Amount of time in milliseconds (ms) to wait before starting any internal processes, can be used to perform to maintenance on the pod before actually letting it starts", "0")
    .option("--cursor-file <string>", "cursor lock file (ex: cursor.lock)")
    .option("--production-mode", "Enable Production Mode, with high-speed parallel processing", DEFAULT_PRODUCTION_MODE)
    .option("--verbose", "Enable verbose logging")
    .option(`--prometheus-hostname <string>", "Hostname for Prometheus metrics (ex: ${DEFAULT_PROMETHEUS_HOSTNAME})`)
    .option(`--prometheus-port <int>", "Port for Prometheus metrics (ex: ${DEFAULT_PROMETHEUS_PORT})`)
    .option("--prometheus-disabled", "If set, will not send metrics to Prometheus")
    .option("-p, --params <string...>", "Set a params for parameterizable modules. Can be specified multiple times. (ex: -p module1=valA -p module2=valX&valY)", []);
}
