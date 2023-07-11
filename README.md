# [`Substreams`](https://substreams.streamingfast.io/) Sink Webhook

> `substreams-sink-webhook` is a tool that allows developers to pipe data extracted from a blockchain to Webhook.

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- TweetNaCl
  - [TweetNaCl: a crypto library in 100 tweets](http://tweetnacl.cr.yp.to/)
  - [TweetNaCl.js](https://tweetnacl.js.org/)
  - [TweetNaclSharp](https://github.com/XeroXP/TweetNaclSharp)
- Discord Webhooks
  - [interactions-and-bot-users](https://discord.com/developers/docs/interactions/receiving-and-responding#interactions-and-bot-users)
  - [security-and-authorization](https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization)

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
CHAIN=wax

# Substreams package
SPKG=eosio.token
MODULE_NAME=map_transfers
START_BLOCK=-1
PARAM=map_transfers=symcode=WAX&quantity_gte=100000000000

# Prometheus
PROMETHEUS_PORT=9102
PROMETHEUS_HOSTNAME=127.0.0.1
PROMETHEUS_DISABLED=false

# CLI
VERBOSE=true
DISABLE_PING=true
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
