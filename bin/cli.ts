#!/usr/bin/env node

import { Option } from "commander";
import { commander, logger } from "substreams-sink";
import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import { keyPair } from "../src/auth/ed25519.js";
import { ping } from "../src/ping.js";

export interface WebhookRunOptions extends commander.RunOptions {
  webhookUrl: string;
  privateKey: string;
  expiryTime: number;
  maximumAttempts: number;
  disablePing: string;
  disableSignature: string;
}

const webhookUrlOption = new Option("--webhook-url <string>", "Webhook URL to send POST").makeOptionMandatory().env("WEBHOOK_URL");
const privateKeyOption = new Option("--private-key <string>", "Ed25519 private key to sign POST data payload").makeOptionMandatory().env("PRIVATE_KEY");

// Run Webhook Sink
const program = commander.program(pkg);
const command = commander.run(program, pkg);
command.addOption(webhookUrlOption);
command.addOption(privateKeyOption);
command.addOption(new Option("--disable-ping <boolean>", "Disable ping on init").choices(["true", "false"]).env("DISABLE_PING").default(false));
command.addOption(new Option("--disable-signature <boolean>", "Disable Ed25519 signature").choices(["true", "false"]).env("DISABLE_SIGNATURE").default(false));
command.addOption(new Option("--maximum-attempts <number>", "Maximum attempts to retry POST").env("MAXIMUM_ATTEMPTS").default(100));
command.action(action);

program
  .command("keypair")
  .description("Generate random Ed25519 private & public keys")
  .action(() => {
    const { publicKey, privateKey } = keyPair();
    console.log(`PUBLIC_KEY=${publicKey}`);
    console.log(`PRIVATE_KEY=${privateKey}`);
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
