import { miniTree, filledCount, relationCounts, relationLegend, RELATIONS } from "./tree";
import { RANKS, priceOf, matrixTotal } from "../plan";
import { walletMeter } from "./rankWallet";

/** One matrix as a full-width row with its ranks side by side, so more matrices just add rows */
const matrixRow = (data, matrix) => {
    const index = Math.max(0, matrix - 1);
    const topRank = Number(data?.user?.ranks?.[index] ?? 0);

    const rankBlock = (rank) => {
        const info = data?.matrices?.[matrix]?.[rank];
        const isUnlocked = topRank >= rank && Number(info?.root ?? 0) > 0;
        const filled = filledCount(info?.nodes);
        const counts = relationCounts(info?.nodes);
        const spotCount = Number(info?.spotCount ?? 0);

        const countChip = (rel) => counts[rel] > 0 ? /*html*/`
            <span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full ${RELATIONS[rel].dot}"></span>${counts[rel]} ${RELATIONS[rel].label.toLowerCase()}</span>
        ` : "";

        return /*html*/`
        <div class="flex min-w-0 flex-col rounded-2xl border-2 border-sky-300 bg-gradient-to-b from-white to-sky-50 p-3 sm:p-4">
            <div class="flex items-center justify-between gap-2">
                <span class="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-4 py-0.5 text-base font-black text-white ring-2 ring-white">R${rank}</span>
                <span class="font-mono text-sm font-extrabold tabular-nums text-blue-950">${priceOf(matrix, rank)} USDT</span>
            </div>

            <div class="${isUnlocked ? "" : "opacity-40 grayscale"} mt-1">
                ${miniTree(info?.nodes, { matrix, rank })}
            </div>

            ${walletMeter({ wallet: info?.wallet ?? 0n, price: info?.price ?? 0n, rank })}
            <div class="h-2"></div>

            ${isUnlocked ? /*html*/`
            <div class="flex items-center justify-between gap-2 rounded-xl bg-yellow-300 px-3 py-1.5">
                <span class="min-w-0 truncate font-mono text-xs font-bold tabular-nums text-blue-950">Spot #${info.root}</span>
                <span class="shrink-0 font-mono text-xs font-bold tabular-nums text-blue-950">${filled}/12 filled</span>
            </div>
            <div class="mt-1.5 flex min-h-4 flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-medium text-blue-900/70">
                ${countChip(2)}${countChip(3)}${countChip(0)}${countChip(1)}
            </div>
            <div class="mt-auto flex items-center justify-between gap-2 pt-2">
                <span class="text-[11px] font-medium text-blue-900/70">${spotCount} ${spotCount === 1 ? "spot" : "spots"} in R${rank}</span>
                <button type="button" onclick="openRank(${matrix}, ${rank})"
                    class="rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                    View R${rank} →
                </button>
            </div>` : /*html*/`
            <div class="mt-auto rounded-xl bg-sky-100 px-3 py-2 text-center text-xs font-semibold text-blue-900/70">
                Your R${rank} wallet buys your first R${rank} spot when full
            </div>`}
        </div>
        `;
    };

    return /*html*/`
    <section class="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
        <div class="rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-sky-50 to-cyan-100 p-3 text-blue-950 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.7)] sm:p-5">
            <header class="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
                <div class="flex min-w-0 items-center gap-3">
                    <h2 class="truncate text-xl font-black sm:text-2xl">Matrix ${matrix}</h2>
                    <span class="shrink-0 rounded-xl border-2 border-yellow-400 bg-blue-950 px-3 py-0.5 font-mono text-sm font-extrabold tabular-nums text-white">
                        ${priceOf(matrix, 1)} USDT entry
                    </span>
                </div>
                <span class="text-[11px] font-medium text-blue-900/60">R1 to R${RANKS.at(-1)} total ${matrixTotal(matrix)} USDT</span>
            </header>
            <div class="grid gap-3 md:grid-cols-3">
                ${RANKS.map(rankBlock).join("")}
            </div>
        </div>
    </section>
    `;
};

/** Colour key shown once above the matrix rows */
const legendBar = /*html*/`
    <div class="mx-auto mt-6 w-full max-w-6xl px-4 sm:px-6">
        <div class="rounded-2xl bg-blue-950/60 px-4 py-2.5 text-sky-100 ring-1 ring-inset ring-sky-300/30">
            ${relationLegend}
        </div>
    </div>
`;

export { matrixRow, legendBar };
