import "dotenv/config";

// defaults
export const DEFAULT_HOSTNAME = "127.0.0.1";
export const DEFAULT_PROMETHEUS_PORT = 9102;
export const DEFAULT_PROMETHEUS_HOSTNAME = DEFAULT_HOSTNAME;
export const DEFAULT_PROMETHEUS_DISABLED = false;
export const DEFAULT_VERBOSE = false;
export const DEFAULT_DISABLE_PING = false;
export const DEFAULT_CONCURRENCY = 1;
export const DEFAULT_DISABLE_PRODUCTION_MODE = false;
export const DEFAULT_DELAY_BEFORE_START = 0;

// optional
export const HOSTNAME = process.env.HOSTNAME ?? DEFAULT_HOSTNAME;
export const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT ?? String(DEFAULT_PROMETHEUS_PORT));
export const PROMETHEUS_HOSTNAME = process.env.PROMETHEUS_HOSTNAME ?? HOSTNAME;
export const PROMETHEUS_DISABLED = JSON.parse(process.env.PROMETHEUS_DISABLED ?? String(DEFAULT_PROMETHEUS_DISABLED)) as boolean;
export const VERBOSE = JSON.parse(process.env.VERBOSE ?? String(DEFAULT_VERBOSE)) as boolean;
export const DISABLE_PRODUCTION_MODE = JSON.parse(process.env.DISABLE_PRODUCTION_MODE ?? String(DEFAULT_DISABLE_PRODUCTION_MODE)) as boolean;
export const DISABLE_PING = JSON.parse(process.env.DISABLE_PING ?? String(DEFAULT_DISABLE_PING)) as boolean;
export const CONCURRENCY = parseInt(process.env.CONCURRENCY ?? String(DEFAULT_CONCURRENCY));
export const DELAY_BEFORE_START = parseInt(process.env.DELAY_BEFORE_START ?? String(DEFAULT_DELAY_BEFORE_START));
export const SECRET_KEY = process.env.SECRET_KEY;
export const WEBHOOK_URL = process.env.WEBHOOK_URL ?? process.env.URL;
export const CURSOR_FILE = process.env.CURSOR_FILE;
export const SUBSTREAMS_API_TOKEN = process.env.SUBSTREAMS_API_TOKEN;
export const SUBSTREAMS_API_TOKEN_ENVVAR = process.env.SUBSTREAMS_API_TOKEN_ENVVAR;
