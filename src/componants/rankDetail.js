import { shortAddress, timestampToUTC } from "../web3/connect";
import { detailTree, kindOf, relationOf, filledCount, relationLegend, SLOTS } from "./tree";
import { MATRICES, RANKS, GENESIS_ID, priceOf } from "../plan";
import { referralLink } from "./userInfo";
import { walletCard } from "./rankWallet";

const PAGE_SIZE = 30;

let spotPage = 0;
let spotPages = 1;

if (typeof window !== "undefined") {
    // Shows one spot's panel and rings its node without re-rendering the tree
    window.selectSpot = (id) => {
        document.querySelectorAll("[data-spot-panel], [data-ref-panel]").forEach((el) => {
            el.classList.toggle("hidden", (el.dataset.spotPanel ?? el.dataset.refPanel) !== String(id));
        });
        document.querySelectorAll("[data-node]").forEach((el) => {
            el.querySelector("[data-node-ring]")?.classList.toggle("opacity-0", el.dataset.node !== String(id));
        });
    };

    // Pages through the spot list in place, so hundreds of spots never stretch the card
    window.spotPageStep = (delta) => {
        spotPage = Math.min(spotPages - 1, Math.max(0, spotPage + delta));
        document.querySelectorAll("[data-spot-page]").forEach((el) => {
            el.classList.toggle("hidden", el.dataset.spotPage !== String(spotPage));
        });
        const label = document.querySelector("[data-spot-page-label]");
        if (label) label.textContent = `${spotPage + 1} / ${spotPages}`;
    };

    window.jumpToSpot = (event) => {
        event?.preventDefault?.();
        const input = document.querySelector("[data-spot-jump]");
        const id = Number(input?.value ?? 0);
        const owned = (input?.dataset?.owned ?? "").split(",").map(Number);
        const error = document.querySelector("[data-spot-jump-error]");
        if (!owned.includes(id)) {
            if (error) error.textContent = id > 0 ? `#${id} is not one of your spots in this rank.` : "Enter a spot number.";
            return;
        }
        window.openSpot?.(id);
    };
}

const tab = ({ label, isActive, onclick }) => /*html*/`
    <button type="button" onclick="${onclick}" aria-pressed="${isActive}"
        class="${isActive
            ? "bg-gradient-to-b from-red-500 to-red-700 text-white ring-2 ring-white"
            : "bg-blue-900/60 text-sky-100 ring-1 ring-inset ring-sky-300/40 hover:bg-blue-800"}
            rounded-full px-4 py-1 text-sm font-extrabold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
        ${label}
    </button>
`;

const meter = (value, max) => {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return /*html*/`
        <div class="h-2 w-full overflow-hidden rounded-full bg-sky-200">
            <div class="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600" style="width:${pct}%"></div>
        </div>
    `;
};

const spotPanel = (spot, { data, isVisible }) => {
    const kind = kindOf(spot?.kind);
    const rel = relationOf(spot?.relation);
    const children = Number(spot?.children ?? 0);
    const step = Math.min(9, Number(spot?.step ?? 0));
    const isRoot = spot?.id === data?.root;
    const created = spot?.createdAt > 0 ? timestampToUTC(spot.createdAt).full : "—";
    const owner = spot?.ownerId === GENESIS_ID ? "Genesis (ID 1)" : `ID ${spot?.ownerId ?? 0} · ${shortAddress(spot?.account)}`;
    const position = spot?.overhead > 0 ? `${SLOTS[spot.where] ?? "Slot"} under #${spot.overhead}` : "Top of the tree";

    const row = (label, value) => /*html*/`
        <div class="flex items-center justify-between gap-3 py-2">
            <span class="shrink-0 text-[13px] font-medium text-blue-900/70">${label}</span>
            <span class="min-w-0 truncate text-right text-[13px] font-semibold text-blue-950">${value}</span>
        </div>
    `;

    return /*html*/`
    <div data-spot-panel="${spot?.id}" class="${isVisible ? "" : "hidden"}">
        <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-xl font-black tabular-nums">#${spot?.id}</span>
            <span class="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${kind.tone}">${kind.label}</span>
        </div>

        <!-- Who brought this spot in -->
        <div class="mt-2 flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-inset ring-sky-200">
            <span class="h-3.5 w-3.5 shrink-0 rounded-full ${rel.dot} ring-2 ring-white"></span>
            <div class="min-w-0">
                <p class="text-[13px] font-bold text-blue-950">${rel.label}</p>
                <p class="text-[11px] text-blue-900/70">${rel.detail}</p>
            </div>
        </div>

        <div class="mt-2 divide-y divide-sky-200">
            ${row("Owner", `<span class="font-mono tabular-nums">${owner}</span>`)}
            ${row("Position", position)}
            ${row("Created", `<span class="font-mono tabular-nums">${created}</span>`)}
        </div>

        <div class="mt-3 grid gap-3">
            <div>
                <div class="mb-1 flex items-center justify-between text-[13px]">
                    <span class="font-medium text-blue-900/70">Direct slots</span>
                    <span class="font-mono font-bold tabular-nums">${children}/3</span>
                </div>
                <div class="flex gap-1.5">
                    ${SLOTS.map((name, i) => /*html*/`
                    <span class="flex-1 rounded-lg py-1 text-center text-[10px] font-bold uppercase tracking-wide
                        ${i < children ? "bg-red-600 text-white" : "bg-sky-100 text-blue-900/50 ring-1 ring-inset ring-sky-300"}">${name}</span>`).join("")}
                </div>
            </div>
            <div>
                <div class="mb-1 flex items-center justify-between text-[13px]">
                    <span class="font-medium text-blue-900/70">Second line</span>
                    <span class="font-mono font-bold tabular-nums">${step}/9</span>
                </div>
                ${meter(step, 9)}
                <p class="mt-1 text-[11px] text-blue-900/60">${step >= 9 ? "This spot is full. New members go to the owner's next spot." : `${9 - step} places left before this spot is full.`}</p>
            </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
            ${!isRoot ? /*html*/`
            <button type="button" onclick="openSpot(${spot?.id})"
                class="rounded-xl bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                View tree from #${spot?.id}
            </button>` : ""}
            ${isRoot && spot?.overhead > 0 ? /*html*/`
            <button type="button" onclick="openSpot(${spot.overhead})"
                class="rounded-xl bg-white px-3 py-2 text-xs font-bold text-blue-800 ring-1 ring-inset ring-sky-300 transition hover:bg-sky-50 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                ↑ Up to #${spot.overhead}
            </button>` : ""}
        </div>
    </div>
    `;
};

/** Referral link of the selected spot's owner, so it can be shared straight from the tree */
const refPanel = (spot, { isVisible }) => {
    const ownerId = Number(spot?.ownerId ?? 0);
    const rel = relationOf(spot?.relation);
    const directs = Number(spot?.ownerDirects ?? 0);
    const link = referralLink(ownerId || GENESIS_ID);
    const ownerLabel = ownerId === GENESIS_ID ? "Genesis" : `ID ${ownerId}`;

    return /*html*/`
    <div data-ref-panel="${spot?.id}" class="${isVisible ? "" : "hidden"}">
        <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="flex min-w-0 items-center gap-2">
                <span class="h-3 w-3 shrink-0 rounded-full ${rel.dot} ring-2 ring-white"></span>
                <p class="min-w-0 truncate text-sm font-bold">
                    Spot <span class="font-mono tabular-nums">#${spot?.id}</span> · owner <span class="font-mono tabular-nums">${ownerLabel}</span>
                </p>
            </div>
            <span class="shrink-0 text-[11px] font-semibold text-blue-900/70">
                <span class="font-mono font-black tabular-nums text-blue-950">${directs}</span> direct ${directs === 1 ? "referral" : "referrals"}
            </span>
        </div>
        <div class="mt-2 flex min-w-0 items-stretch gap-2">
            <input readonly value="${link}" aria-label="Referral link for spot ${spot?.id}"
                class="min-w-0 flex-1 truncate rounded-xl border border-sky-300 bg-white px-3 py-2 font-mono text-xs text-blue-950 sm:text-sm" />
            <button type="button" onclick="copyFrom(this)" data-copy="${link}"
                class="shrink-0 rounded-xl bg-gradient-to-b from-yellow-300 to-amber-400 px-4 text-sm font-extrabold text-blue-950 ring-1 ring-inset ring-amber-500/50 transition hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
                Copy
            </button>
        </div>
        <p class="mt-1.5 text-[11px] text-blue-900/60">New members who join with this link are placed under ${rel.key === "self" ? "you" : `${ownerLabel}`}.</p>
    </div>
    `;
};

/** The account's spots in this rank, newest first, 30 per page */
const spotList = (data) => {
    const rank = Number(data?.rank ?? 1);
    const root = Number(data?.root ?? 0);
    const current = Number(data?.holding?.current ?? 0);
    const owned = Array.isArray(data?.holding?.spots) ? data.holding.spots : [];
    if (!owned.length) return "";

    const newestFirst = [ ...owned ].reverse();
    const pages = [];
    for (let i = 0; i < newestFirst.length; i += PAGE_SIZE) pages.push(newestFirst.slice(i, i + PAGE_SIZE));

    // Open on the page that holds the spot being viewed
    spotPages = pages.length;
    const rootIndex = newestFirst.indexOf(root);
    spotPage = rootIndex >= 0 ? Math.floor(rootIndex / PAGE_SIZE) : 0;

    const chip = (id) => /*html*/`
        <button type="button" onclick="openSpot(${id})"
            class="${id === root ? "bg-blue-700 text-white" : "bg-white text-blue-900 ring-1 ring-inset ring-sky-300 hover:bg-sky-50"}
                rounded-lg px-1 py-1.5 font-mono text-[11px] font-bold tabular-nums transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
            #${id}
        </button>
    `;

    return /*html*/`
    <div class="rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-white to-sky-50 p-4 text-blue-950 sm:p-5">
        <div class="mb-2 flex items-center justify-between gap-2">
            <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700/70 sm:text-[11px]">Your spots in R${rank}</p>
            <span class="font-mono text-xs font-bold tabular-nums text-blue-900/70">${owned.length} total</span>
        </div>

        ${current > 0 ? /*html*/`
        <button type="button" onclick="openSpot(${current})"
            class="mb-3 flex w-full items-center justify-between gap-2 rounded-xl bg-yellow-300 px-3 py-2 text-left ring-1 ring-inset ring-amber-500/40 transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
            <span class="text-xs font-bold">Active spot</span>
            <span class="font-mono text-sm font-black tabular-nums">#${current}</span>
        </button>` : ""}

        <!-- Jump to a spot -->
        <form onsubmit="jumpToSpot(event)" class="mb-3 flex gap-2">
            <input data-spot-jump data-owned="${owned.join(",")}" type="number" min="1" inputmode="numeric" placeholder="Spot number"
                oninput="document.querySelector('[data-spot-jump-error]').textContent = ''"
                class="min-w-0 flex-1 rounded-xl border border-sky-300 bg-white px-3 py-1.5 font-mono text-sm text-blue-950" aria-label="Spot number" />
            <button type="submit" class="shrink-0 rounded-xl bg-blue-700 px-3 text-xs font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">Go</button>
        </form>
        <p data-spot-jump-error class="-mt-2 mb-2 min-h-0 text-[11px] text-red-700"></p>

        <!-- Fixed-size pages -->
        ${pages.map((page, p) => /*html*/`
        <div data-spot-page="${p}" class="${p === spotPage ? "" : "hidden"} grid grid-cols-5 gap-1.5">
            ${page.map(chip).join("")}
        </div>`).join("")}

        ${pages.length > 1 ? /*html*/`
        <div class="mt-3 flex items-center justify-between gap-2">
            <button type="button" onclick="spotPageStep(-1)" aria-label="Newer spots"
                class="rounded-lg bg-white px-3 py-1 text-sm font-bold text-blue-800 ring-1 ring-inset ring-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">‹</button>
            <span data-spot-page-label class="font-mono text-xs font-bold tabular-nums text-blue-900/70">${spotPage + 1} / ${pages.length}</span>
            <button type="button" onclick="spotPageStep(1)" aria-label="Older spots"
                class="rounded-lg bg-white px-3 py-1 text-sm font-bold text-blue-800 ring-1 ring-inset ring-sky-300 hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">›</button>
        </div>` : ""}
        <p class="mt-2 text-[11px] text-blue-900/60">Newest first. The active spot is where your next referral lands.</p>
    </div>
    `;
};

const rankDetail = (data) => {
    const matrix = Number(data?.matrix ?? 1);
    const rank = Number(data?.rank ?? 1);
    const root = Number(data?.root ?? 0);
    const nodes = Array.isArray(data?.nodes) ? data.nodes : [];
    const details = data?.details ?? {};
    const hasTree = root > 0 && nodes[0]?.id > 0;

    const filledNodes = nodes.filter((n) => n.id > 0 && details[n.id]);
    const panels = filledNodes.map((n) => spotPanel(details[n.id], { data, isVisible: n.id === root })).join("");
    const refPanels = filledNodes.map((n) => refPanel(details[n.id], { isVisible: n.id === root })).join("");

    return /*html*/`
    <section class="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-8 sm:px-6">
        <!-- Matrix and rank tabs -->
        <div class="flex flex-wrap items-center justify-between gap-3">
            <button type="button" onclick="goHome()"
                class="rounded-xl bg-blue-900/60 px-3 py-1.5 text-sm font-bold text-sky-100 ring-1 ring-inset ring-sky-300/40 transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                ← Home
            </button>
            <div class="flex flex-wrap items-center gap-2">
                ${MATRICES.map((m) => tab({ label: `Matrix ${m}`, isActive: m === matrix, onclick: `openRank(${m}, ${rank})` })).join("")}
                <span class="mx-1 h-6 w-px bg-sky-300/30"></span>
                ${RANKS.map((r) => tab({ label: `R${r}`, isActive: r === rank, onclick: `openRank(${matrix}, ${r})` })).join("")}
            </div>
        </div>

        <div class="mt-4 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
            <!-- Full tree and the selected spot's referral link -->
            <div class="flex min-w-0 flex-col gap-4 self-start">
            <div class="min-w-0 rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-sky-50 to-cyan-100 p-3 text-blue-950 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.7)] sm:p-5">
                <header class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                        <span class="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-4 py-0.5 text-lg font-black text-white ring-2 ring-white">R${rank}</span>
                        <span class="text-base font-extrabold">Matrix ${matrix}</span>
                        <span class="font-mono text-sm font-bold tabular-nums text-blue-900/70">${priceOf(matrix, rank)} USDT</span>
                    </div>
                    ${hasTree ? `<span class="rounded-xl bg-yellow-300 px-3 py-1 font-mono text-xs font-bold tabular-nums">Spot #${root} · ${filledCount(nodes)}/12 filled</span>` : ""}
                </header>

                ${hasTree ? /*html*/`
                <div class="mt-3">${detailTree(nodes, { matrix, rank, selected: root })}</div>
                <div class="mt-2 text-blue-900/80">${relationLegend}</div>
                <p class="mt-1 text-[11px] text-blue-900/60">Tap a spot to see its details.</p>` : /*html*/`
                <div class="mt-6 rounded-2xl bg-sky-100 px-4 py-10 text-center">
                    <p class="text-base font-bold">No tree to show yet</p>
                    <p class="mt-1 text-sm text-blue-900/70">${data?.user?.isRegistered ? `Reach R${rank} in Matrix ${matrix} to get a spot here.` : "Register first to get your own spots."}</p>
                </div>`}
            </div>

            ${refPanels ? /*html*/`
            <div class="rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-white to-sky-50 p-4 text-blue-950 sm:p-5">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700/70 sm:text-[11px]">Referral link of this spot</p>
                ${refPanels}
            </div>` : ""}
            </div>

            <!-- Spot detail and spot list -->
            <div class="flex min-w-0 flex-col gap-4">
                <div class="rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-white to-sky-50 p-4 text-blue-950 sm:p-5">
                    <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700/70 sm:text-[11px]">Spot detail</p>
                    ${panels || `<p class="text-sm text-blue-900/70">Nothing selected.</p>`}
                </div>
                ${walletCard(data?.rankWallet)}
                ${spotList(data)}
            </div>
        </div>
    </section>
    `;
};

export { rankDetail };
