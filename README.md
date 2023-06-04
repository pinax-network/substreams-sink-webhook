# [`Substreams`](https://substreams.streamingfast.io/) Sink Webhook

> `substreams-sink-webhook` is a tool that allows developers to pipe data extracted from a blockchain to Webhook.

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [**Temporal** documentation](https://docs.temporal.io/)
  - [activity-retries](https://docs.temporal.io/dev-guide/typescript/features#activity-retries)
- Discord Webhooks
  - [interactions-and-bot-users](https://discord.com/developers/docs/interactions/receiving-and-responding#interactions-and-bot-users)
  - [security-and-authorization](https://discord.com/developers/docs/interactions/receiving-and-responding#security-and-authorization)

## [Pre-built binaries](https://github.com/pinax-network/substreams-sink-webhook/releases)
- MacOS
- Linux
- Windows

## Docker environment

```bash
docker build -t substreams-sink-webhook .
docker run -it --rm --env-file .env substreams-sink-webhook run
```

## `.env` Environment variables

```
PRIVATE_KEY=PVT_K1_...
PUBLIC_KEY=PUB_K1_...
SUBSTREAMS_API_TOKEN=...
URL=http://localhost:3000
```

## Help

```
$ substreams-sink-webhook --help

Usage: substreams-sink-webhook [options] [command]

Substreams Sink Webhook

Options:
  -v, --version                           version for substreams-sink-webhook
  -e --substreams-endpoint <string>       Substreams gRPC endpoint to stream data from
  --manifest                              URL of Substreams package
  --spkg                                  Substreams package (ex: eosio.token)
  --module_name                           Name of the output module (declared in the manifest)
  --chain <string>                        Substreams supported chain (ex: eth)
  -s --start-block <int>                  Start block to stream from (defaults to -1, which means
                                          the initialBlock of the first module you are streaming)
  -t --stop-block <string>                Stop block to end stream at, inclusively
  --substreams-api-token <string>         API token for the substream endpoint
  --substreams-api-token-envvar <string>  Environnement variable name of the API token for the
                                          substream endpoint (default: "SUBSTREAMS_API_TOKEN")
  --delay-before-start <int>              [OPERATOR] Amount of time in milliseconds (ms) to wait
                                          before starting any internal processes, can be used to
                                          perform to maintenance on the pod before actually letting
                                          it starts (default: "0")
  --cursor-file <string>                  cursor lock file (default: "cursor.lock")
  --production-mode                       Enable Production Mode, with high-speed parallel
                                          processing (default: false)
  --verbose                               Enable verbose logging (default: true)
  --metrics-listen-address <string>       The process will listen on this address for Prometheus
                                          metrics requests (default: "localhost")
  --metrics-listen-port <int>             The process will listen on this port for Prometheus
                                          metrics requests (default: "9102")
  --metrics-disabled                      If set, will not send metrics to Prometheus (default:
                                          false)
  -p, --params <string...>                Set a params for parameterizable modules. Can be
                                          specified multiple times. (ex: -p module1=valA -p
                                          module2=valX&valY) (default: [])
  --url <string>                          Webhook URL to send POST.
  --private-key <string>                  Private key to sign POST data payload (ex: "PVT_K1_...")
  -h, --help                              display help for command

Commands:
  completion                              Generate the autocompletion script for the specified
                                          shell
  help                                    Display help for command
```

## Features

- [x] POST data to URL
- [x] Map hash module
- [x] Signing policy
  - [x] R1 private keys
  - [ ] Ether.js
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
- [ ] Prometheus metrics
- [x] PING URL on start (invalid + valid)
- [ ] Save `cursor.lock` file on successful POST
- [x] Use `clock` data
