#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action } from "../index.js"
import pkg from "../package.json";
import { createWorker } from "../src/worker.js";

// Run Webhook Sink
const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option('--url <string>', 'Webhook URL to send POST.');
command.option('--private-key <string>', 'Private key to sign POST data payload (ex: "PVT_K1_...")')
command.action(action);

// Create Temporal Worker
program.command("worker")
    .description("Create Temporal Worker")
    .action(createWorker);

program.command('completion').description('Generate the autocompletion script for the specified shell');
program.command('help').description('Display help for command');
program.showHelpAfterError();
program.parse();
