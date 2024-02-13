# [`Substreams`](https://substreams.streamingfast.io/) Sink Webhook

> `substreams-sink-webhook` is a tool that allows developers to pipe data extracted from a blockchain to Webhook.

## HTTP Server examples

- [`Bun`](/examples/bun) - https://bun.sh/
- [`Express`](/examples/express) - https://expressjs.com/
- [`node:http`](/examples/node) - https://nodejs.org/api/http.html
- [POST request](/examples/http)

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
x-signature-ed25519: 8f01c66ccda5b987c43d913290419572ea586dbef2077fa166c4a84797e1d2c76b305bc67ed43efb1fc841562620a61cb59c4d8a13de689a2e98ead19190f80c
x-signature-timestamp: 1707776632
```

**body**

> The body will be a flatten JSON string with the following structure:

```json
{
  "status": 200,
  "cursor": "OJGbpO9ZnZcwvxW38_FO8KWwLpcyA1lrUQPgKRFL04Py8yCW35v1VTB1O0-Elami3RztQlOp2tmcHC9y9ZQFuoDrxLpj6yU-FXorwoHr_OfqLPumMQwTJ-hgWeuKYNLeWDjTagn4ersEtNGzbvLaY0UxZZUhK2G62z1VptdXJfEWuiJmyjmrIZrRhK-WoNAS_rEkQ7L1xCmhDzJ4K0dTPcSDNPKZuDR2",
  "session": {
    "traceId": "3cbb0a1c772a47a72995d95f4c6d2cff",
    "resolvedStartBlock": 53448515
  },
  "clock": {
    "timestamp": "2024-02-12T22:23:51.000Z",
    "number": 53448530,
    "id": "f843bc26cea0cbd50b09699546a8a97de6a1727646c17a857c5d8d868fc26142"
  },
  "manifest": {
    "substreamsEndpoint": "https://polygon.substreams.pinax.network:443",
    "chain": "polygon",
    "finalBlockOnly": "false",
    "moduleName": "map_blocks",
    "type": "sf.substreams.v1.Clock",
    "moduleHash": "44c506941d5f30db6cca01692624395d1ac40cd1"
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
const PUBLIC_KEY = "APPLICATION_PUBLIC_KEY";

// get headers and body from POST request
const signature = request.headers.get("x-signature-ed25519");
const timestamp = request.headers.get("x-signature-timestamp");
const body = await request.text();

// validate signature using public key
const isVerified = nacl.sign.detached.verify(
  Buffer.from(timestamp + body),
  Buffer.from(signature, "hex"),
  Buffer.from(PUBLIC_KEY, "hex")
);

if (!isVerified) {
  return new Response("invalid request signature", { status: 401 });
}
```

## `.env` Environment variables

```env
# Webhook
SECRET_KEY="<Ed25519 Secret-key>"
WEBHOOK_URL=http://127.0.0.1:3000
PORT=9102

# Get Substreams API Key
# https://app.pinax.network
# https://app.streamingfast.io/
SUBSTREAMS_API_KEY="<Substreams API Token @ https://pinax.network>"

# Substreams Package (*.spkg)
MANIFEST=https://github.com/pinax-network/substreams/releases/download/blocks-v0.1.0/blocks-v0.1.0.spkg
MODULE_NAME=map_blocks
START_BLOCK=-10
PRODUCTION_MODE=true

# Webhook (Optional)
DISABLE_PING=false
DISABLE_SIGNATURE=false
VERBOSE=true
MAXIMUM_ATTEMPTS=100
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
  --substreams-api-key <string>        API key for the Substream endpoint (env: SUBSTREAMS_API_KEY)
  --delay-before-start <int>           Delay (ms) before starting Substreams (default: 0, env: DELAY_BEFORE_START)
  --cursor-path <string>               File path or URL to cursor lock file (default: "cursor.lock", env: CURSOR_PATH)
  --http-cursor-auth <string>          Basic auth credentials for http cursor (ex: username:password) (env: HTTP_CURSOR_AUTH)
  --production-mode <boolean>          Enable production mode, allows cached Substreams data if available (default: "false", env: PRODUCTION_MODE)
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
  --disable-ping <boolean>             Disable ping on init (choices: "true", "false", default: false, env: DISABLE_PING)
  --disable-signature <boolean>        Disable Ed25519 signature (choices: "true", "false", default: false, env: DISABLE_SIGNATURE)
  --maximum-attempts <number>          Maximum attempts to retry POST (default: 100, env: MAXIMUM_ATTEMPTS)
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
