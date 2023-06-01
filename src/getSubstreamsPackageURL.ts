// will be replaced by `@substreams/registry`
export function getSubstreamsPackageURL(spkg: string) {
    // Antelope
    if ( spkg === "eosio.token") return "https://github.com/pinax-network/substreams/releases/download/eosio.token-v0.12.1/eosio-token-v0.12.1.spkg";
    if ( spkg === "common") return "https://github.com/pinax-network/substreams/releases/download/common-v0.5.0/common-v0.5.0.spkg";
    throw new Error("Unsupported spkg");
}