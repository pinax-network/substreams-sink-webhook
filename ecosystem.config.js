const server = {
  name: "server",
  script: "node ./dist/bin/cli.js server",
}

const worker = {
  name: "worker",
  script: "node ./dist/bin/cli.js worker",
}

const run = {
  name: "run",
  script: "node ./dist/bin/cli.js run https://github.com/pinax-network/substreams/releases/download/eosio.token-v0.12.1/eosio-token-v0.12.1.spkg map_transfers -e https://wax.firehose.eosnation.io:9001 --production-mode -s -1 --verbose",
}

module.exports = {
  apps : [
    server,
    worker,
    run
]
}