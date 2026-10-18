import { shortAddress } from "../web3/connect";

const logo = /*html*/`
    <img src="/logo.svg" alt="" width="40" height="40" class="h-7 w-7 shrink-0 drop-shadow-[0_4px_12px_rgba(250,204,21,0.35)] sm:h-10 sm:w-10" />
`;

const walletIcon = /*html*/`
    <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <circle cx="16.5" cy="13" r="1.3" fill="currentColor" />
    </svg>
`;

/** Our own button in the site's style; AppKit's modal still handles connect, switch and disconnect */
const walletButton = (data) => {
    const wallet = data?.wallet;
    const address = wallet?.address ?? "";

    if (wallet?.isDemo) {
        return /*html*/`
            <button type="button" onclick="toggleTestPanel()"
                class="flex items-center gap-2 rounded-full border-2 border-yellow-400 bg-blue-950/80 px-3 py-1.5 text-sm font-bold text-yellow-300 transition hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
                <span class="h-2 w-2 rounded-full bg-yellow-300"></span>
                <span class="font-mono tabular-nums">${shortAddress(address)}</span>
                <span class="hidden text-[10px] font-extrabold uppercase sm:inline">Demo</span>
            </button>
        `;
    }

    if (address) {
        return /*html*/`
            <button type="button" onclick="connectWallet()" aria-label="Wallet ${shortAddress(address)}, open account"
                class="flex items-center gap-2 rounded-full bg-blue-950/80 px-3 py-1.5 text-sm font-bold text-white ring-2 ring-sky-300/70 transition hover:bg-blue-900 hover:ring-yellow-300 focus-visible:outline-none focus-visible:ring-yellow-300">
                <span class="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"></span>
                <span class="font-mono tabular-nums">${shortAddress(address)}</span>
            </button>
        `;
    }

    return /*html*/`
        <button type="button" onclick="connectWallet()"
            class="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-yellow-200 via-yellow-300 to-amber-500 px-3 py-2 sm:gap-2 sm:px-4 text-sm font-black text-blue-950 ring-2 ring-white/80 shadow-[0_6px_20px_-6px_rgba(250,204,21,0.8)] transition hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300">
            ${walletIcon}
            <span class="sm:hidden">Connect</span>
            <span class="hidden sm:inline">Connect wallet</span>
        </button>
    `;
};

const header = (data) => /*html*/`
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
        <a href="#/" class="flex min-w-0 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300">
            ${logo}
            <span class="truncate text-xl font-black italic leading-none tracking-tight sm:text-3xl">
                <span class="bg-gradient-to-b from-white via-sky-100 to-sky-300 bg-clip-text text-transparent">INFINITY</span>
                <span class="bg-gradient-to-b from-yellow-100 via-yellow-300 to-amber-500 bg-clip-text text-transparent">MONEY</span>
            </span>
        </a>
        <div class="flex shrink-0 items-center gap-2">
            ${walletButton(data)}
        </div>
    </header>
`;

export { header, logo };
