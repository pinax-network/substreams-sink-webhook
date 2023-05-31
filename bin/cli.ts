#!/usr/bin/env node

import { createServer } from "../examples/node:http/server.js";
import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import * as sink from "./substreams-sink.js";

// Run Webhook Sink
const program = sink.program(pkg);
const command = sink.run(program, pkg);
command.option("--url <string>", "Webhook URL to send POST.");
command.option("--private-key <string>", 'Private key to sign POST data payload (ex: "PVT_K1_...")');
command.action(action);

// Example listening server
const server = program.command("server");
server.description("Create Server to listen on Message Queue");
server.option("--public-key <string>", 'Public key to verify message (ex: "PUB_K1_...")');
server.option("-p --port <int>", "Listens on port number.", String(8000));
server.action(createServer);

program.parse();
