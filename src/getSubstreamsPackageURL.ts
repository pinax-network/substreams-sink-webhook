const versions = {
    "eosio.token": "v0.13.0",
    "common": "v0.5.0",
    "erc20": "v0.1.0"
}

// will be replaced by `@substreams/registry`
export function getSubstreamsPackageURL(spkg: string) {
    // Antelope
    if ( spkg === "eosio.token") return `https://github.com/pinax-network/substreams/releases/download/eosio.token-${versions["eosio.token"]}/eosio-token-${versions["eosio.token"]}.spkg`;
    if ( spkg === "common") return `https://github.com/pinax-network/substreams/releases/download/common-${versions.common}/common-${versions.common}.spkg`;
    if ( spkg === "erc20") return `https://github.com/pinax-network/substreams-cookbook/releases/download/erc20-${versions.erc20}/erc20-${versions.erc20}.spkg`;
    throw new Error("Unsupported spkg");
}