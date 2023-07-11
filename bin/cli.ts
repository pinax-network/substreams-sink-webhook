#!/usr/bin/env node

import pkg from "../package.json" assert { type: "json" };
import { commander, logger } from "substreams-sink";
import { keyPair } from "../src/signMessage.js";
import { action } from "../index.js";
import { ping } from "../src/ping.js";
import { Option } from "commander";

export interface WebhookRunOptions extends commander.RunOptions {
    url: string;
    secretKey: string;
    concurrency: number;
    disablePing: boolean;
}

// Run Webhook Sink
const program = commander.program(pkg);
const command = commander.run(program, pkg);
command.addOption(new Option("--webhook-url <string>", "Webhook URL to send POST").makeOptionMandatory().env("WEBHOOK_URL"))
command.addOption(new Option("--secret-key <string>", "TweetNaCl Secret-key to sign POST data payload").makeOptionMandatory().env("SECRET_KEY"))
command.addOption(new Option("--concurrency <number>", "Concurrency of requests").env("CONCURRENCY").default(1))
command.addOption(new Option("--disable-ping", "Disable ping on init").env("DISABLE_PING").default(false))
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
    .action(async (options: any) => {
        logger.settings.type = "pretty";
        const url = options.url ?? WEBHOOK_URL;
        const secretKey = options.secretKey ?? process.env.SECRET_KEY;
        const response = await ping(url, secretKey);
        console.log(response);
    })
program.parse();
