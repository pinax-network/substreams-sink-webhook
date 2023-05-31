#!/usr/bin/env node

import { createServer } from "../examples/node:http/server.js";
import { action } from "../index.js";
import pkg from "../package.json";
import { cli } from "substreams-sink";

// Run Webhook Sink
const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option("--url <string>", "Webhook URL to send POST.");
command.option("--private-key <string>", 'Private key to sign POST data payload (ex: "PVT_K1_...")');
command.action(action);

// Example listening server
program
  .command("server")
  .description("Create Server to listen on Message Queue")
  .option("--public-key <string>", 'Public key to verify message (ex: "PUB_K1_...")')
  .option("-p --port <int>", "Listens on port number.", String(8000))
  .action(createServer);

program.command("completion").description("Generate the autocompletion script for the specified shell");
program.command("help").description("Display help for command");
program.showHelpAfterError();
program.parse();
