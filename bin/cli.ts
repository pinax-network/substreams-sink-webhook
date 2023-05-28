#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.option('--url <string>', 'Webhook URL to send POST.');
command.option('--private-key <string>', 'Private key to sign POST data payload (ex: "PVT_K1_...")')
command.action(action);
program.parse();
