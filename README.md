# [`Substreams`](https://substreams.streamingfast.io/) Sink Webhook

> `substreams-sink-webhook` is a tool that allows developers to pipe data extracted from a blockchain to Webhook.

## HTTP Server examples

- [`Bun`](/examples/bun) - https://bun.sh/
- [`Deno`](/examples/deno) - https://deno.com/runtime
- [`Express`](/examples/express) - https://expressjs.com/
- [`node:http`](/examples/node:http) - https://nodejs.org/api/http.html
- [POST request](/examples/post.http)

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- TweetNaCl
  - [TweetNaCl: a crypto library in 100 tweets](http://tweetnacl.cr.yp.to/)
  - [TweetNaCl.js](https://tweetnacl.js.org/)
  - [TweetNaclSharp](https://github.com/XeroXP/TweetNaclSharp)
- Discord Webhooks
  - [interactions-and-bot-users](https://discord.com/developers/docs/interactions/receiving-and-responding#interactions-and-bot-users)
  - [security-and-authorization](https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization)

## POST Message

The POST message will be a JSON object with the following structure:

**headers**

```http
POST http://localhost:3000 HTTP/1.1
content-type: application/json
x-signature-ed25519: 6ec208fc250059fdb0fa543e01339ee3c6967da6fc7b6bf86dcd8217fa2e130ce2e17a5258fcf9bbe415de223d00eaee2f6949ef3a44594b42e7fb1a53481802
x-signature-timestamp: 1696733583
```

**body**

> The body will be a flatten JSON string with the following structure:

```json
{
  "status": 200,
  "cursor": "T0S2BNqDj6a8pKMA6bEXAaWwLpc_DFltXAvkKhhBj4L29XqRiMmiVjVzbU_UxPzyiRLsSV-q2tzLEih6oMZR7oLpwbA2vHI_F39_l9vm_ODoe6CjP1tJdekzCuzcN9DRWD7eYgv7c7EK6dXiMqeMM0ZkNsEjfmLn2j0EpYJWdaUVunUzlT2vdc6Ag_iU-dAQrOV0QLelxyOkUzJ-fx5cbJ6GNaPKuW51bQ==",
  "session": {
    "traceId": "4ebea20349c16844d92bf6c961f627fa",
    "resolvedStartBlock": 32900744
  },
  "clock": {
    "timestamp": "2022-09-09T20:23:38.000Z",
    "number": 32901090,
    "id": "9058ded4fd65b4de2d772564366f1b61bc328bac7a4c4b87d73ca6ab4bae6be8"
  },
  "manifest": {
    "substreamsEndpoint": "https://polygon.substreams.pinax.network:443",
    "chain": "polygon",
    "finalBlockOnly": "false",
    "moduleName": "map_block_stats",
    "type": "subtivity.v1.BlockStats",
    "moduleHash": "6fb7bbc60685bbfc1cd209d26697639e05efdb24"
  },
  "data": {
    ...
  }
}
```

## Validate Ed25519 signature

```typescript
import nacl from "tweetnacl";

// ...HTTP server

// get headers and body from POST request
const rawBody = await request.text();
const signature = request.headers.get("x-signature-ed25519");
const expiry = Number(request.headers.get("x-signature-ed25519-expiry"));
const publicKey = request.headers.get("x-signature-ed25519-public-key");

if (new Date().getTime() >= expiry) return new Response("signature expired", { status: 401 });

// validate signature using public key
const payload = JSON.stringify({ exp: expiry, id: publicKey });
const isVerified = nacl.sign.detached.verify(
  Buffer.from(payload),
  Buffer.from(signature, "hex"),
  Buffer.from(publicKey, "hex")
);

if (!isVerified) {
  return new Response("invalid request signature", { status: 401 });
}
```

## `.env` Environment variables

```env
# Webhook
SECRET_KEY="<Ed25519 Secret-key>"
PUBLIC_KEY="<Ed25519 Public-key>"
WEBHOOK_URL=http://127.0.0.1:3000

# Substreams endpoint
SUBSTREAMS_API_TOKEN="<Substreams API Token @ https://pinax.network>"
SUBSTREAMS_ENDPOINT=https://polygon.substreams.pinax.network:443

# Substreams package
MANIFEST=https://github.com/pinax-network/subtivity-substreams/releases/download/v0.3.0/subtivity-ethereum-v0.3.0.spkg
MODULE_NAME=map_block_stats
START_BLOCK=-1
```

## Help

```
$ substreams-sink-webhook --help

Usage: substreams-sink-webhook run [options]

Substreams Sink Webhook

Options:
  -e --substreams-endpoint <string>    Substreams gRPC endpoint to stream data from (env: SUBSTREAMS_ENDPOINT)
  --manifest <string>                  URL of Substreams package (env: MANIFEST)
  --module-name <string>               Name of the output module (declared in the manifest) (env: MODULE_NAME)
  -s --start-block <int>               Start block to stream from (defaults to -1, which means the initialBlock of the first module you are streaming) (default: "-1", env: START_BLOCK)
  -t --stop-block <int>                Stop block to end stream at, inclusively (env: STOP_BLOCK)
  -p, --params <string...>             Set a params for parameterizable modules. Can be specified multiple times. (ex: -p module1=valA -p module2=valX&valY) (default: [], env: PARAMS)
  --substreams-api-token <string>      API token for the substream endpoint or API key if '--auth-issue-url' is specified (default: "", env: SUBSTREAMS_API_TOKEN)
  --auth-issue-url <string>            URL used to issue a token (default: "https://auth.pinax.network/v1/auth/issue", env: AUTH_ISSUE_URL)
  --delay-before-start <int>           Delay (ms) before starting Substreams (default: 0, env: DELAY_BEFORE_START)
  --cursor-path <string>               File path or URL to cursor lock file (default: "cursor.lock", env: CURSOR_PATH)
  --http-cursor-auth <string>          Basic auth credentials for http cursor (ex: username:password) (env: HTTP_CURSOR_AUTH)
  --production-mode <boolean>          Enable production mode, allows cached substreams data if available (default: "false", env: PRODUCTION_MODE)
  --inactivity-seconds <int>           If set, the sink will stop when inactive for over a certain amount of seconds (default: 300, env: INACTIVITY_SECONDS)
  --hostname <string>                  The process will listen on this hostname for any HTTP and Prometheus metrics requests (default: "localhost", env: HOSTNAME)
  --port <int>                         The process will listen on this port for any HTTP and Prometheus metrics requests (default: 9102, env: PORT)
  --metrics-labels [string...]         To apply generic labels to all default metrics (ex: --labels foo=bar) (default: {}, env: METRICS_LABELS)
  --collect-default-metrics <boolean>  Collect default metrics (default: "false", env: COLLECT_DEFAULT_METRICS)
  --headers [string...]                Set headers that will be sent on every requests (ex: --headers X-HEADER=headerA) (default: {}, env: HEADERS)
  --final-blocks-only <boolean>        Only process blocks that have pass finality, to prevent any reorg and undo signal by staying further away from the chain HEAD (default: "false", env: FINAL_BLOCKS_ONLY)
  --verbose <boolean>                  Enable verbose logging (default: "false", env: VERBOSE)
  --webhook-url <string>               Webhook URL to send POST (env: WEBHOOK_URL)
  --secret-key <string>                TweetNaCl Secret-key to sign POST data payload (env: SECRET_KEY)
  --disable-ping                       Disable ping on init (default: false, env: DISABLE_PING)
  -h, --help                           display help for command
```

## Docker environment

Pull from GitHub Container registry
```bash
docker pull ghcr.io/pinax-network/substreams-sink-webhook:latest
```

Run with `.env` file
```bash
docker run -it --rm --env-file .env ghcr.io/pinax-network/substreams-sink-webhook:latest run
```

Build from source
```bash
docker build -t substreams-sink-webhook .
```

## Features

- [x] POST data to URL
- [x] Include Substreams Manifest to payload
  - substreamsEndpoint
  - chain
  - finalBlockOnly
  - moduleName
  - type
  - moduleHash
- [x] Include Substreams Clock to payload
  - timestamp
  - number
  - id
- [x] Includes Substreams Session to payload
  - traceId
  - resolvedStartBlock
- [x] Includes Substreams cursor to payload
- [x] Signing policy
  - [x] TweetNaCl
  - [ ] ~~R1 private keys~~
  - [ ] ~~Ether.js~~
- [x] All messages are sent in block order, no need to parallelize
- [x] Support for Final Blocks Only `--final-blocks-only`
- [x] Support for Production Mode `--production-mode`
- [x] Retry policy
  - [x] Exponential backoff (2x)
  - [x] Initial Interval (1s)
  - [x] Maximum Attempts (Infinity)
  - [x] Maximum Interval (100 * initialInterval)
- [x] Dockerfile
- [x] Provide CLI arguments or Environment Variables (`.env`)
- [x] Allow params injection via `--params` or `-p`
- [x] Prometheus metrics
  - [x] includes metrics from `substreams-sink`
  - [x] HTTP POST requests
  - [x] HTTP errors
- [x] PING URL on start (invalid + valid)
- [x] Save `cursor.lock` only after successful POST
  - [ ] Enforce retry policy on HTTP cursor updates
