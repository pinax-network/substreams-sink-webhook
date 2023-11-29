#!/usr/bin/env node

import { Option } from "commander";
import { commander, logger } from "substreams-sink";
import { action } from "../index.js";
import pkg from "../package.json" assert { type: "json" };
import { keyPair } from "../src/auth/ed25519.js";
import { ping } from "../src/ping.js";

export interface WebhookRunOptions extends commander.RunOptions {
  webhookUrl: string;
  secretKey: string;
  disablePing: boolean;
  expiryTime: number;
}

const expirationOption = new Option("--expiry-time <number>", "Time before a transmission becomes invalid (in seconds)").env("EXPIRY_TIME").default(40)

// Run Webhook Sink
const program = commander.program(pkg);
const command = commander.run(program, pkg);
command.addOption(new Option("--webhook-url <string>", "Webhook URL to send POST").makeOptionMandatory().env("WEBHOOK_URL"));
command.addOption(new Option("--secret-key <string>", "TweetNaCl Secret-key to sign POST data payload").makeOptionMandatory().env("SECRET_KEY"));
command.addOption(new Option("--disable-ping", "Disable ping on init").env("DISABLE_PING").default(false));
command.addOption(expirationOption);
command.action(action);

program
  .command("keypair")
  .description("Generate TweetNaCl keypair")
  .action(() => {
    const { publicKey, secretKey } = keyPair();
    console.log(`PUBLIC_KEY=${publicKey}`);
    console.log(`SECRET_KEY=${secretKey}`);
  });

program
  .command("ping")
  .description("Ping Webhook URL")
  .addOption(new Option("--webhook-url <string>", "Webhook URL to send POST").makeOptionMandatory().env("WEBHOOK_URL"))
  .addOption(new Option("--secret-key <string>", "TweetNaCl Secret-key to sign POST data payload").makeOptionMandatory().env("SECRET_KEY"))
  .addOption(expirationOption)
  .action(async (options: WebhookRunOptions) => {
    logger.settings.type = "hidden";
    const response = await ping(options.webhookUrl, options.secretKey, options.expiryTime);
    if (response) console.log("✅ OK");
    else console.log("⁉️ ERROR");
  });
program.parse();
