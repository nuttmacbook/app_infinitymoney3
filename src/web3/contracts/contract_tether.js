/** BSC USDT (BEP20, 18 decimals); only the calls the app makes */
export const Tether = {
    address: "0x55d398326f99059fF775485246999027B3197955",
    abi: [
        { type: "function", name: "balanceOf", stateMutability: "view", inputs: [ { name: "account", type: "address" } ], outputs: [ { name: "", type: "uint256" } ] },
        { type: "function", name: "allowance", stateMutability: "view", inputs: [ { name: "owner", type: "address" }, { name: "spender", type: "address" } ], outputs: [ { name: "", type: "uint256" } ] },
        { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [ { name: "spender", type: "address" }, { name: "amount", type: "uint256" } ], outputs: [ { name: "", type: "bool" } ] },
    ],
};
