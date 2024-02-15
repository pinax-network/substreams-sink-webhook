#!/usr/bin/env node

import { Option } from "commander";
import { commander, logger } from "substreams-sink";
import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import { keyPair } from "../src/auth.js";
import { ping } from "../src/ping.js";

export interface WebhookRunOptions extends commander.RunOptions {
  webhookUrl: string;
  privateKey?: string;
  maximumAttempts: number;
}

const webhookUrlOption = new Option("--webhook-url <string>", "Webhook URL to send POST").makeOptionMandatory().env("WEBHOOK_URL");
const privateKeyOption = new Option("--private-key <string>", "Ed25519 private key to sign POST data payload").env("PRIVATE_KEY");

// Run Webhook Sink
const program = commander.program(pkg);
const command = commander.run(program, pkg);
command.addOption(webhookUrlOption);
command.addOption(privateKeyOption);
command.addOption(new Option("--maximum-attempts <number>", "Maximum attempts to retry POST").env("MAXIMUM_ATTEMPTS").default(100));
command.action(action);

program
  .command("keypair")
  .description("Generate random Ed25519 private & public keys")
  .action(() => {
    const { publicKey, privateKey } = keyPair();
    process.stdout.write(JSON.stringify({ publicKey, privateKey }, null, 2));
  });

program
  .command("ping")
  .description("Ping Webhook URL")
  .addOption(webhookUrlOption)
  .addOption(privateKeyOption)
  .action(async (options: WebhookRunOptions) => {
    logger.settings.type = "hidden";
    const response = await ping(options.webhookUrl, options.privateKey);
    if (response) console.log("✅ OK");
    else console.log("⁉️ ERROR");
  });
program.parse();
