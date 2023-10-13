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
    "cursor": "3ErAq5aeVa2E561uHfBu6qWwLpcyAlJrUAPhKxFLhtnz9HLH3JikBTQmaRqEkKz52RO4HQuk2I3EFi8p88JXtNa8kb4y6XdtRH5-loC_qLHscPOmawkSIu9kDrmJYdLfUzjSagj7c7tRsdLlPKaLY0BkY850fTOwizxW8IYFJqNAv3Mykm2ucMfVgf6fooJArbYgFuyinCzyBz16Kk4LO8TQZ_bN7jx1",
    "session": {
        "traceId": "06eb726db08090e476eb2dbeff72f1bb",
        "resolvedStartBlock": 48458405
    },
    "clock": {
        "timestamp": "2023-10-08T02:53:03.000Z",
        "number": 48458410,
        "id": "3b54021525ec17d05946cfa86b92ab12787fb6f4fe25b59ac5380db39cd6ac73"
    },
    "manifest": {
        "substreamsEndpoint": "https://polygon.substreams.pinax.network:9000",
        "moduleName": "map_block_stats",
        "type": "subtivity.v1.BlockStats",
        "moduleHash": "0a363b2a63aadb76a525208f1973531d3616fbae",
        "chain": "polygon"
    },
    "data": {
        "transactionTraces": "36",
        "traceCalls": "212",
        "uaw": [
            "d6b1cca00889daa9adc1d6e76b9a120086a13aab",
            "675fe893a74815a35f867a12cbdd0637b7d7d6d4",
            "42b07d313de7a38dc5cea48e326e545450cc4322",
            "8ed47843e5030b6f06e6f204fcf2725378bb837a",
            "9ced478d8d6fcaad332d9abf30415c8e48ac8079",
            "21c3de23d98caddc406e3d31b25e807addf33633",
            "2f59cde588b6d3661e8792632844f511d5e2da02",
            "84a611b71254f5fccb1e5a619ad723cad8a03638",
            "7ba865f70e32c9f46f67e33fe06139c8c31a2fad",
            "18264397296fd982e432b4cd4942295c5bca50f8",
            "258cfdaeee1b411bbb63a48cb030faed6720bb15",
            "207cf8cdaec06610d7f9c92fec513e70520ce655",
            "f746fb75a9c1d0f1c9799e434aea2aef90f7aa22",
            "d3961bdbf7ad806b8e870a1cfbf7e54b5247020e",
            "314c9a7a79ec28835ae68bcf5c0fd696141f85b4",
            "2802fa14557b4f1afdf94af082b18c37d5786a2e",
            "74eb675ed60a6f332e156c5a9ac376ee8d4d905d",
            "5543ff441d3b0fcce59aa08eb52f15d27294af21",
            "a1ab1c841898fe94900d00d9312ba954e4f81501",
            "3dd12eb5ae0f1a106fb358c8b99830ab5690a7a2",
            "51fafb35f31c434066267fc86ea24d8424115d2a",
            "8709264ba5b56be8750193dad1a99f8b9d6ad3d6",
            "c2b5f79a5768893b8087667b391c1381c502ab5c",
            "85d8d0fc4e5a1f6dc823ee4baf486758a2fcb19c",
            "7537cb7b7e8083ff8e68cb5c0ca18553ab54946f",
            "d0a8cb58efcee1caee48f3c357074862ca8210dc"
        ]
    }
}
```

## Validate Ed25519 signature

```typescript
import nacl from "tweetnacl";

// ...HTTP server

// get headers and body from POST request
const rawBody = await request.text();
const timestamp = request.headers.get("x-signature-timestamp");
const signature = request.headers.get("x-signature-ed25519");

// validate signature using public key
const isVerified = nacl.sign.detached.verify(
  Buffer.from(timestamp + body),
  Buffer.from(signature, 'hex'),
  Buffer.from(PUBLIC_KEY, 'hex')
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
SUBSTREAMS_ENDPOINT=https://polygon.substreams.pinax.network:9000

# Substreams package
MANIFEST=https://github.com/pinax-network/subtivity-substreams/releases/download/v0.3.0/subtivity-ethereum-v0.3.0.spkg
MODULE_NAME=map_block_stats
START_BLOCK=-1
FINAL_BLOCKS_ONLY=true
```

## Help

```
$ substreams-sink-webhook --help

Usage: substreams-sink-webhook run [options]

Substreams Sink Webhook

Options:
  -e --substreams-endpoint <string>       Substreams gRPC endpoint to stream data from
  --manifest <string>                     URL of Substreams package
  --module-name <string>                  Name of the output module (declared in the manifest)
  -s --start-block <int>                  Start block to stream from (defaults to -1, which
                                          means the initialBlock of the first module you are
                                          streaming)
  -t --stop-block <int>                   Stop block to end stream at, inclusively
  -p, --params <string...>                Set a params for parameterizable modules. Can be
                                          specified multiple times. (ex: -p module1=valA -p
                                          module2=valX&valY)
  --substreams-api-token <string>         API token for the substream endpoint
  --substreams-api-token-envvar <string>  Environnement variable name of the API token for the
                                          substream endpoint (ex: SUBSTREAMS_API_TOKEN)
  --delay-before-start <int>              [OPERATOR] Amount of time in milliseconds (ms) to wait
                                          before starting any internal processes, can be used to
                                          perform to maintenance on the pod before actually
                                          letting it starts
  --cursor-file <string>                  cursor lock file (ex: cursor.lock)
  --disable-production-mode               Disable production mode, allows debugging modules
                                          logs, stops high-speed parallel processing
  --restart-inactivity-seconds <int>      If set, the sink will restart when inactive for over a
                                          certain amount of seconds (ex: 60)
  --hostname <string>                     The process will listen on this hostname for any HTTP
                                          and Prometheus metrics requests (ex: localhost)
  --port <int>                            The process will listen on this port for any HTTP and
                                          Prometheus metrics requests (ex: 9102)
  --verbose                               Enable verbose logging
  --webhook-url <string>                  Webhook URL to send POST (env: WEBHOOK_URL)
  --secret-key <string>                   TweetNaCl Secret-key to sign POST data payload (env:
                                          SECRET_KEY)
  --disable-ping                          Disable ping on init (default: false, env:
                                          DISABLE_PING)
  --final-blocks-only <boolean>           Only process blocks that have pass finality, to prevent any reorg and undo signal by staying further away from the chain HEAD (default: "false", env: FINAL_BLOCKS_ONLY)

  -h, --help                              display help for command
```

## Docker environment

Pull from GitHub Container registry
```bash
docker pull ghcr.io/pinax-network/substreams-sink-webhook:latest
```

Build from source
```bash
docker build -t substreams-sink-webhook .
```

Run with `.env` file
```bash
docker run -it --rm --env-file .env substreams-sink-webhook run
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
