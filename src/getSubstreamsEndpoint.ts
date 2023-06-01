export function getSubstreamsEndpoint(chain: string) {
    // Antelope
    if ( chain === "wax") return "https://wax.firehose.eosnation.io:9001";
    if ( chain === "eos") return "https://eos.firehose.eosnation.io:9001";

    // EVM
    if ( chain === "polygon") return "https://polygon-mar.firehose.pinax.network:9000";
    if ( chain === "eth") return "https://eth-mar.firehose.pinax.network:9000";
    if ( chain === "sepolia") return "https://sepolia-mar.firehose.pinax.network:9000";
    if ( chain === "goerli") return "https://goerli-mar.firehose.pinax.network:9000";
    if ( chain === "rinkeby") return "https://rinkeby-mar.firehose.pinax.network:9000";
    if ( chain === "mumbai") return "https://mumbai-mar.firehose.pinax.network:9000";
    if ( chain === "eth") return "https://eth-mar.firehose.pinax.network:9000";
    if ( chain === "ethereum") return "https://ethereum-mar.firehose.pinax.network:9000";
    if ( chain === "bsc") return "https://bsc-mar.firehose.pinax.network:9000";

    throw new Error("Unsupported chain");
}