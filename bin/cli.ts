#!/usr/bin/env node

import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import * as sink from "../externals/substreams-sink.js";

// Run Webhook Sink
const program = sink.program(pkg);
const command = sink.option(program, pkg);
command.option("--url <string>", "Webhook URL to send POST.");
command.option("--private-key <string>", 'Private key to sign POST data payload (ex: "PVT_K1_...")');
command.option("--concurrency <number>", "Concurrency of requests", "1");
command.action(action);
program.parse();
