import { formNumber } from "../web3/connect";

/*
 * A rank wallet: money the contract saves for one matrix/rank. It fills from slots in your spots
 * (lower ranks, reborns and newborns) and buys a new spot in this rank as soon as it holds the price.
 */

const progress = (wallet, price) => (price > 0n ? Math.min(100, Number((wallet * 10000n) / price) / 100) : 0);

/** Compact meter for the rank cards on the home page */
const walletMeter = ({ wallet = 0n, price = 0n, rank = 1 } = {}) => /*html*/`
    <div class="mt-2 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-inset ring-sky-300">
        <div class="flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-blue-900/70">R${rank} wallet</span>
            <span class="font-mono text-xs font-black tabular-nums text-blue-950">${formNumber(wallet, 18, 2)} / ${formNumber(price, 18, 0)}</span>
        </div>
        <div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sky-200" role="progressbar" aria-label="R${rank} wallet" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress(wallet, price)}">
            <div class="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500" style="width:${progress(wallet, price)}%"></div>
        </div>
    </div>
`;

/** Full card for the rank page */
const walletCard = ({ wallet = 0n, price = 0n, matrix = 1, rank = 1 } = {}) => {
    const missing = price > wallet ? price - wallet : 0n;

    return /*html*/`
    <div class="rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-white to-sky-50 p-4 text-blue-950 sm:p-5">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700/70 sm:text-[11px]">Matrix ${matrix} · R${rank} wallet</p>
        <p class="mt-1 font-mono text-2xl font-black tabular-nums">${formNumber(wallet, 18, 2)} <span class="text-sm font-bold text-blue-900/70">/ ${formNumber(price, 18, 0)} USDT</span></p>
        <div class="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-sky-200" role="progressbar" aria-label="R${rank} wallet" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress(wallet, price)}">
            <div class="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-500" style="width:${progress(wallet, price)}%"></div>
        </div>
        <p class="mt-2 text-[11px] text-blue-900/70">
            ${formNumber(missing, 18, 2)} USDT more buys your next R${rank} spot. Your spots fill this wallet as members land in them; it is spent only on R${rank} spots and cannot be withdrawn.
        </p>
    </div>
    `;
};

export { walletMeter, walletCard };
