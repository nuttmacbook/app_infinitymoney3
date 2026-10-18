/*
 * Where each contract lives, for every contract in the project.
 *   - Real networks: addresses.json, written by dev/chain/deploy-live.mjs after each deploy (committed)
 *   - Local test chain: VITE_LOCAL_ADDRESSES, a JSON map passed by dev/chain/start.mjs while npm run dev runs
 * Contract files call addressOf("<ContractName>"), so a new contract never needs a new env variable.
 */

import deployments from "./addresses.json";

const ZERO = "0x0000000000000000000000000000000000000000";

// Same switch as connect.js: "local" while testing, otherwise the network name in addresses.json
const NETWORK = import.meta.env.VITE_CHAIN || "bsc";

const localAddresses = () => {
    try { return JSON.parse(import.meta.env.VITE_LOCAL_ADDRESSES ?? "{}"); } catch { return {}; }
};

const book = NETWORK === "local" ? localAddresses() : deployments?.[NETWORK]?.contracts ?? {};

/** Deployed address of a contract on the current network, or the zero address if it is not deployed there */
const addressOf = (name) => book?.[name] ?? ZERO;

export { addressOf, NETWORK };
