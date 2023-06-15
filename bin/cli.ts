#!/usr/bin/env node

import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import * as sink from "../externals/substreams-sink.js";
import { keyPair } from "../src/signMessage.js";

// Run Webhook Sink
const program = sink.program(pkg);
const command = sink.option(program, pkg);
command.option("--url <string>", "Webhook URL to send POST.");
command.option("--secret-key <string>", 'TweetNaCl Secret-key to sign POST data payload');
command.option("--concurrency <number>", "Concurrency of requests", "1");
command.option("--disable-ping", "Disable ping on init");
command.action(action);

program.command("keypair")
    .description("Generate TweetNaCl keypair")
    .action(() => {
        const { publicKey, secretKey } = keyPair();
        console.log(`Public Key: ${publicKey}`);
        console.log(`Secret Key: ${secretKey}`);
    })
program.parse();
