#!/usr/bin/env node

import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import * as sink from "../externals/substreams-sink.js";
import { keyPair } from "../src/signMessage.js";
import { ping } from "../src/ping.js";
import { WEBHOOK_URL } from "../src/config.js";
import { logger } from "../src/logger.js";

export interface WebhookRunOptions extends sink.RunOptions {
    url: string;
    secretKey: string;
    concurrency: string;
    disablePing: boolean;
}

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

program.command("ping")
    .description("Ping Webhook URL")
    .option("--url <string>", "Webhook URL to send POST.")
    .option("--secret-key <string>", 'TweetNaCl Secret-key to sign POST data payload')
    .action(async (options) => {
        logger.settings.type = "pretty";
        const url = options.url ?? WEBHOOK_URL;
        const secretKey = options.secretKey ?? process.env.SECRET_KEY;
        const response = await ping(url, secretKey);
        console.log(response);
    })
program.parse();
