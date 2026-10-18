import { kitbox, chain, utils } from "kitbox";

const box = new kitbox();

// Test mode talks to the local chain from `npm run chain` (real solc build, real transactions)
const IS_LOCAL = import.meta.env.VITE_CHAIN === "local";
const LOCAL_RPC = import.meta.env.VITE_RPC_URL ?? "http://127.0.0.1:8545";
const LOCAL_CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID ?? 1337);

const localChain = chain.defineChain({
    id: LOCAL_CHAIN_ID,
    caipNetworkId: `eip155:${LOCAL_CHAIN_ID}`,
    chainNamespace: "eip155",
    name: "Infinity local chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: { default: { http: [ LOCAL_RPC ] } },
    // kitbox reads an explorer URL from the first network; the local chain has none, so point at the node
    blockExplorers: { default: { name: "Local", url: LOCAL_RPC } },
});

const modal = box.createModal(import.meta.env.VITE_PROJECT_ID, [ IS_LOCAL ? localChain : chain.bsc ], "dark", {
    "--w3m-accent": "#facc15",
    "--w3m-font-family": "Kanit",
    "--w3m-border-radius": "16px",
    "--w3m-background-color": "#0b2a8a",
    "--w3m-text-color": "#ffffff",
});

const { shortAddress, formNumber, timestampToUTC, delay } = utils;

const GENESIS = "0x0000000000000000000000000000000000000001";
const EXPLORER_TX = "https://bscscan.com/tx/";

/** Falls back to BSC's public RPC while no wallet has picked a network yet */
const readRpc = () => {
    if (IS_LOCAL) return LOCAL_RPC;
    try {
        return box.getCurrentRpc();
    } catch {
        return chain.bsc.rpcUrls.default.http[0];
    }
};

const isAddress = (value) => /^0x[a-fA-F0-9]{40}$/.test(String(value ?? ""));
const sameAddress = (a, b) => isAddress(a) && isAddress(b) && a.toLowerCase() === b.toLowerCase();

export {
    box,
    modal,
    chain,
    shortAddress,
    formNumber,
    timestampToUTC,
    delay,
    readRpc,
    isAddress,
    sameAddress,
    GENESIS,
    EXPLORER_TX,
    IS_LOCAL,
    LOCAL_RPC,
    LOCAL_CHAIN_ID,
};
