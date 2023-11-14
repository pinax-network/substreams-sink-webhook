import { run, bench, group, baseline } from 'mitata';
import { signMessage, verify } from './signMessage.js';

const secretKey = "3faae992336ea6599fbee55bb2605f1a1297c7288b860725cdfc8794413559dba3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const publicKey = "a3cb7366ee8ca77225b4d41772e270e4e831d171d1de71d91707c42e7ba82cc9";
const body = '{"cursor":"gBCLb0z81lU8vbvZVzJkEaWwLpc_DFhqVQ3jLxVJgYH2pSTFicymUzd9bx2GlKH51RboGgmo19eZRX588ZED7YW8y7FhuSM6EHh4wNzo87Dne6KjPQlIIOhjC-iJMNncUT7SYgz9f7UI5N_nb6XZMxMyMZEuK2blizdZqoZXIfAVsHthkjz6cJ6Bga_A-YtEq-AnEuf1xn6lDzF1Lx4LOc_RNqGe6z4nN3Rq","clock":{"timestamp":"2023-06-15T04:21:58.000Z","number":250665484,"id":"0ef0da0cf870f489833ac498da073acadf895d22f3dce68483aa43cac1d27b17"},"manifest":{"chain":"wax","moduleName":"map_transfers","moduleHash":"6aa24e6aa34db4a4faf55c69c6f612aeb06053c2"},"data":{"items":[{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":2,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"banxawallet1","to":"atomicmarket","quantity":"1340.00000000 WAX","memo":"deposit","precision":8,"amount":"134000000000","value":1340},{"trxId":"dd93c64db8ff91cfac74e731fd518548aa831be3d833e6a1fefeac69d2ddd138","actionOrdinal":7,"contract":"eosio.token","action":"transfer","symcode":"WAX","from":"atomicmarket","to":"jft4m.c.wam","quantity":"1206.00000000 WAX","memo":"AtomicMarket Sale Payout - ID #129675349","precision":8,"amount":"120600000000","value":1206}]}}'
const timestamp = 1686802918
const sig = "d7b6b6b76ffb3ad58337d3082bcbeef39de1c2c4cd19f9d24955974358bb85e4bbdde31d055f60b1035750b4ca07e4e4c1398924106352577509b077ddd85802"
const msg = Buffer.from(timestamp + body);

group('sign', () => {
    baseline('baseline', () => {});
    bench('signMessage', () => signMessage(timestamp, body, secretKey));
});

group('verify', () => {
    baseline('baseline', () => {});
    bench('verify', () => verify(msg, sig, publicKey));
});

await run({
    avg: true, // enable/disable avg column (default: true)
    json: false, // enable/disable json output (default: false)
    colors: true, // enable/disable colors (default: true)
    min_max: true, // enable/disable min/max column (default: true)
    collect: false, // enable/disable collecting returned values into an array during the benchmark (default: false)
    percentiles: false, // enable/disable percentiles column (default: true)
});