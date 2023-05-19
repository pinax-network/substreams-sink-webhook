#!/usr/bin/env node

import { cli } from "substreams-sink";
import { action } from "../index.js"
import pkg from "../package.json";

const program = cli.program(pkg);
const command = cli.run(program, pkg);
command.action(action);
program.parse();
