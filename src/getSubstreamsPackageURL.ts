const versions = {
    "eosio.token": "v0.13.0",
    "common": "v0.5.0"
}

// will be replaced by `@substreams/registry`
export function getSubstreamsPackageURL(spkg: string) {
    // Antelope
    if ( spkg === "eosio.token") return `https://github.com/pinax-network/substreams/releases/download/eosio.token-${versions["eosio.token"]}/eosio-token-${versions["eosio.token"]}.spkg`;
    if ( spkg === "common") return `https://github.com/pinax-network/substreams/releases/download/common-${versions.common}/common-${versions.common}.spkg`;
    throw new Error("Unsupported spkg");
}