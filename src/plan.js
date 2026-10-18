// Entry price per rank for each matrix (USDT).
// Add a row here when MATRIX_COUNT grows in Spot3Logic.sol; the home page and tabs follow this list.
const PLAN = [
    { matrix: 1, prices: [ 10, 15, 20 ] },
    { matrix: 2, prices: [ 15, 20, 25 ] },
];

const RANKS = [ 1, 2, 3 ];
const MATRICES = PLAN.map((p) => p.matrix);
const GENESIS_ID = 1;

// Share of every payout that buys the partner presale for the member (PRESALE_PERCENT in Spot3Logic.sol)
const PRESALE_PERCENT = 10;

// Share of every payout sent to the fee treasury (FEE_PERCENT / FEE_TREASURY in Spot3Logic.sol)
const FEE_PERCENT = 10;

// What one Matrix 1 R3 slot-2 spot sends to the slot treasury (SLOT_TREASURY, slotRule in Spot3Logic.sol)
const TREASURY_SLOT_AMOUNT = 20;

const priceOf = (matrix, rank) => PLAN.find((p) => p.matrix === matrix)?.prices?.[rank - 1] ?? 0;
const matrixTotal = (matrix) => RANKS.reduce((sum, r) => sum + priceOf(matrix, r), 0);
const entryTotal = PLAN.reduce((sum, p) => sum + (p.prices[0] ?? 0), 0);

export { PLAN, RANKS, MATRICES, GENESIS_ID, PRESALE_PERCENT, FEE_PERCENT, TREASURY_SLOT_AMOUNT, priceOf, matrixTotal, entryTotal };
