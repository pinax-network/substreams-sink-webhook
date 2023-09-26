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
x-signature-ed25519: 8bfa890aef1bccc753c9cad540844fb1082c610d505a23ecdfabd0bed05cfa429471f0b20f49c3e6125677ab1eedc625fb4f7bfcc8eeff125312a176ba41460b
x-signature-timestamp: 1686802918
```

**body**

```json
{
  "cursor": "gBCLb0z81lU8vbvZVzJkEaWwLpc_DFhqVQ3jLxVJgYH2pSTFicymUzd9bx2GlKH51RboGgmo19eZRX588ZED7YW8y7FhuSM6EHh4wNzo87Dne6KjPQlIIOhjC-iJMNncUT7SYgz9f7UI5N_nb6XZMxMyMZEuK2blizdZqoZXIfAVsHthkjz6cJ6Bga_A-YtEq-AnEuf1xn6lDzF1Lx4LOc_RNqGe6z4nN3Rq",
  "clock": {
    "timestamp": "2023-06-15T04:21:58.000Z",
    "number": 250665484,
    "id": "0ef0da0cf870f489833ac498da073acadf895d22f3dce68483aa43cac1d27b17"
  },
  "manifest": {
    "chain": "wax",
    "moduleName": "map_transfers",
    "moduleHash": "6aa24e6aa34db4a4faf55c69c6f612aeb06053c2"
  },
  "data": {
    "items": [
      {
        "trxId": "dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138",
        "actionOrdinal": 2,
        "contract": "eosio.token",
        "action": "transfer",
        "symcode": "WAX",
        "from": "banxawallet1",
        "to": "atomicmarket",
        "quantity": "1340.00000000 WAX",
        "memo": "deposit",
        "precision": 8,
        "amount": "134000000000",
        "value": 1340
      },
      {
        "trxId": "dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138",
        "actionOrdinal": 7,
        "contract": "eosio.token",
        "action": "transfer",
        "symcode": "WAX",
        "from": "atomicmarket",
        "to": "jft4m.c.wam",
        "quantity": "1206.00000000 WAX",
        "memo": "AtomicMarket Sale Payout - ID #129675349",
        "precision": 8,
        "amount": "120600000000",
        "value": 1206
      }
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

## `.env` Environment variables

```env
# Webhook
SECRET_KEY=...
PUBLIC_KEY=...
WEBHOOK_URL=http://127.0.0.1:3000

# Substreams endpoint
SUBSTREAMS_API_TOKEN=...
SUBSTREAMS_ENDPOINT=https://wax.firehose.eosnation.io:9001

# Substreams package
MANIFEST=https://github.com/pinax-network/substreams/releases/download/eosio.token-v0.13.0/eosio-token-v0.13.0.spkg
MODULE_NAME=map_transfers
START_BLOCK=-1
PARAM=map_transfers=symcode=WAX&quantity_gte=100000000000
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
  --concurrency <number>                  Concurrency of requests (default: 1, env: CONCURRENCY)
  --disable-ping                          Disable ping on init (default: false, env:
                                          DISABLE_PING)
  -h, --help                              display help for command
```

## Features

- [x] POST data to URL
- [x] Map hash module
- [x] Signing policy
  - [x] TweetNaCl
  - [x] ~~R1 private keys~~
  - [ ] ~~Ether.js~~
- [x] Retry policy
  - [x] Exponential backoff (2x)
  - [x] Initial Interval (1s)
  - [x] Maximum Attempts (Infinity)
  - [x] Maximum Interval (100 * initialInterval)
- [x] Queue
  - [x] Conccurent requests (1)
- [x] Dockerfile
- [x] Provide CLI arguments or Environment Variables (`.env`)
- [x] Params injection
- [x] Prometheus metrics
  - [x] add metrics from `substreams-sink`
  - [ ] add queue counter
  - [ ] add post counter
  - [ ] add error counter
  - [ ] update block stats when errors
- [x] PING URL on start (invalid + valid)
- [x] Save `cursor.lock` file on successful POST
- [x] Use `clock` data
