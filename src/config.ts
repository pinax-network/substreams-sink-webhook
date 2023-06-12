import "dotenv/config";

// defaults
export const DEFAULT_HOSTNAME = "127.0.0.1";
export const DEFAULT_PROMETHEUS_PORT = 9102;
export const DEFAULT_PROMETHEUS_HOSTNAME = DEFAULT_HOSTNAME;
export const DEFAULT_PROMETHEUS_DISABLED = false;
export const DEFAULT_VERBOSE = false;

// optional
export const HOSTNAME = process.env.HOSTNAME ?? DEFAULT_HOSTNAME;
export const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT ?? String(DEFAULT_PROMETHEUS_PORT));
export const PROMETHEUS_HOSTNAME = process.env.PROMETHEUS_HOSTNAME ?? HOSTNAME;
export const PROMETHEUS_DISABLED = JSON.parse(process.env.PROMETHEUS_DISABLED ?? String(DEFAULT_PROMETHEUS_DISABLED)) as boolean;
export const VERBOSE = JSON.parse(process.env.VERBOSE ?? String(DEFAULT_VERBOSE)) as boolean;
