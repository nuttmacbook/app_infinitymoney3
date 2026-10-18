import { shortAddress, formNumber } from "../web3/connect";
import { PLAN, GENESIS_ID, entryTotal } from "../plan";

const steps = [
    { title: "Join every matrix",   desc: "One registration places you in R1 of each matrix." },
    { title: "Slots fill your wallets", desc: "Each member who lands in your spot pays you and adds to your rank wallets." },
    { title: "Full wallets buy spots",  desc: "A wallet that reaches its rank's price buys you a new spot in that rank." },
];

const registerCard = (data) => {
    const isConnected = Boolean(data?.isConnected);
    const refId = Number(data?.referrer?.id ?? GENESIS_ID);
    const refAddress = data?.referrer?.address ?? "";
    const isFound = Boolean(data?.referrer?.isFound);
    const entrySplit = PLAN.map((p) => `${p.prices[0]}`).join(" + ");
    const entry = BigInt(data?.entryPrice ?? 0n);
    const balance = BigInt(data?.usdtBalance ?? 0n);
    const hasFunds = balance >= entry;

    const action = isConnected
        ? /*html*/`<button type="button" onclick="registerNow()"
                class="w-full rounded-2xl bg-gradient-to-b from-red-500 to-red-700 py-3.5 text-lg font-black text-white ring-2 ring-white/80 transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-300">
                Register
            </button>`
        : /*html*/`<button type="button" onclick="connectWallet()"
                class="w-full rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-400 py-3.5 text-lg font-black text-blue-950 ring-2 ring-white/80 transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-600">
                Connect wallet
            </button>`;

    return /*html*/`
    <section class="mx-auto mt-6 w-full max-w-xl px-4 sm:mt-10 sm:px-6">
        <div class="overflow-hidden rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-sky-50 to-cyan-100 text-blue-950 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.7)]">
            <div class="flex flex-col items-center gap-1 px-5 pt-6 text-center">
                <span class="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-5 py-1 text-lg font-black text-white ring-2 ring-white">REGISTER</span>
                <h1 class="mt-2 text-xl font-extrabold sm:text-2xl">Join Infinity Money</h1>
                <p class="text-sm text-blue-900/70">Connect your wallet and register under your referrer.</p>
                <p class="mt-2 font-mono text-sm font-bold tabular-nums">Entry ${entryTotal} USDT <span class="text-blue-900/60">(${entrySplit})</span></p>
            </div>

            <!-- Referrer -->
            <div class="mx-5 mt-5 rounded-2xl bg-yellow-300 px-4 py-3 ring-1 ring-inset ring-amber-500/40">
                <p class="text-[13px] font-bold text-blue-950/80">Referrer</p>
                <p class="font-mono text-lg font-black tabular-nums text-blue-950">ID ${refId}${refId === GENESIS_ID ? " · Genesis" : ""}</p>
                ${isFound && refId !== GENESIS_ID ? `<p class="truncate font-mono text-[11px] text-blue-950/70">${shortAddress(refAddress)}</p>` : ""}
            </div>

            ${isFound ? "" : /*html*/`
            <div class="mx-5 mt-3 flex items-start justify-between gap-3 rounded-2xl bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-300" role="alert">
                <p class="text-sm font-medium text-red-700">No member has ID ${refId}, so registering under it will fail.</p>
                <button type="button" onclick="useGenesis()"
                    class="shrink-0 rounded-xl bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                    Use genesis
                </button>
            </div>`}

            ${isConnected ? /*html*/`
            <div class="mx-5 mt-3 flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-2.5 ring-1 ring-inset ${hasFunds ? "ring-sky-300" : "ring-red-300"}">
                <div class="min-w-0">
                    <p class="text-[13px] font-medium text-blue-900/70">Your USDT balance</p>
                    <p class="font-mono text-lg font-black tabular-nums ${hasFunds ? "text-blue-950" : "text-red-700"}">${formNumber(balance, 18, 2)} USDT</p>
                    ${hasFunds ? "" : `<p class="text-[11px] font-medium text-red-700">You need ${formNumber(entry, 18, 0)} USDT to register.</p>`}
                </div>
            </div>` : ""}

            <p class="mx-5 mt-3 text-xs text-blue-900/70">
                Your referrer is saved on this device until you open a different referral link.
            </p>

            <div class="p-5">${action}</div>

            <!-- How it works -->
            <ol class="grid gap-2 border-t border-sky-200 bg-white/50 px-5 py-4">
                ${steps.map((s, i) => /*html*/`
                <li class="flex gap-3">
                    <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-600 font-mono text-sm font-black text-white ring-2 ring-white">${i + 1}</span>
                    <div class="min-w-0">
                        <p class="text-sm font-bold">${s.title}</p>
                        <p class="text-xs text-blue-900/70">${s.desc}</p>
                    </div>
                </li>`).join("")}
            </ol>
        </div>
    </section>
    `;
};

export { registerCard };
