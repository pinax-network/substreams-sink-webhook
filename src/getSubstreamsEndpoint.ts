export function getSubstreamsEndpoint(chain: string) {
    // Antelope
    if ( chain === "wax") return "https://wax.firehose.eosnation.io:9001";
    if ( chain === "eos") return "https://eos.firehose.eosnation.io:9001";

    // EVM
    if ( chain === "sepolia") return "https://sepolia.firehose.pinax.network:9000";
    if ( chain === "goerli") return "https://goerli.firehose.pinax.network:9000";
    if ( chain === "rinkeby") return "https://rinkeby.firehose.pinax.network:9000";
    if ( chain === "mumbai") return "https://mumbai.firehose.pinax.network:9000";
    if ( ["polygon", "matic"].includes(chain)) return "https://polygon.firehose.pinax.network:9000";
    if ( ["bsc", "bnb"].includes(chain)) return "https://bsc.firehose.pinax.network:9000";
    if ( ["eth", "ethereum"].includes(chain)) return "https://eth.firehose.pinax.network:9000";

    throw new Error("Unsupported chain");
}