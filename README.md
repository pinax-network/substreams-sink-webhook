# [`Substreams`](https://substreams.streamingfast.io/) Sink Webhook

> `substreams-sink-webhook` is a tool that allows developers to pipe data extracted from a blockchain to Webhook.

## 📖 References

- [**Substreams** documentation](https://substreams.streamingfast.io/)
- [**Temporal** documentation](https://docs.temporal.io/)
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
docker run -it --rm -p 8000:8000 --env-file .env substreams-sink-webhook server
```

## pm2

```bash
pm2 start
pm2 logs
```

## `.env` Environment variables

```
PRIVATE_KEY=PVT_K1_...
PUBLIC_KEY=PUB_K1_...
SUBSTREAMS_API_TOKEN=...
URL=http://localhost:8000
```

## Help

```
$ substreams-sink-webhook run --help

Usage: substreams-sink-webhook run [options] [<manifest>] <module_name>

Substreams Sink Webhook

Arguments:
  <manifest>                              URL or IPFS hash of Substreams package
  module_name                             Name of the output module (declared in the manifest)

Options:
  -e --substreams-endpoint <string>       Substreams gRPC endpoint to stream data from (default:
                                          "https://mainnet.eth.streamingfast.io:443")
  -s --start-block <int>                  Start block to stream from (defaults to -1, which means the
                                          initialBlock of the first module you are streaming)
  -t --stop-block <string>                Stop block to end stream at, inclusively
  --substreams-api-token <string>         API token for the substream endpoint
  --substreams-api-token-envvar <string>  Environnement variable name of the API token for the substream
                                          endpoint (default: "SUBSTREAMS_API_TOKEN")
  --delay-before-start <int>              [OPERATOR] Amount of time in milliseconds (ms) to wait before
                                          starting any internal processes, can be used to perform to
                                          maintenance on the pod before actually letting it starts
                                          (default: "0")
  --cursor-file <string>                  cursor lock file (default: "cursor.lock")
  --production-mode                       Enable Production Mode, with high-speed parallel processing
                                          (default: false)
  --verbose                               Enable verbose logging (default: false)
  --metrics-listen-address                If non-empty, the process will listen on this address for
                                          Prometheus metrics requests
  --metrics-listen-port                   If non-empty, the process will listen on this port for
                                          Prometheus metrics requests
  -p, --params <string...>                Set a params for parameterizable modules. Can be specified
                                          multiple times. Ex: -p module1=valA -p module2=valX&valY
                                          (default: [])
  --url <string>                          Webhook URL to send POST.
  --private-key <string>                  Private key to sign POST data payload (ex: "PVT_K1_...")
  -h, --help                              display help for command
```

## Features

- [x] POST webhook to URL
- [x] Provide map hash module
- [ ] Use [`tweetnacl`](https://github.com/dchest/tweetnacl-js) to sign POST data payload
- [x] Add Dockerfile
- [x] Add pm2 config
- [ ] Add `ping` command to check if webhook is alive
- Examples
  - [x] node:http
  - [ ] express
  - [ ] bun
  - [ ] deno
- [ ] add flags to `.env` file