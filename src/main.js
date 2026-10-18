import "./main.css";
import { box, modal, IS_LOCAL } from "./web3/connect";
import { MATRICES, RANKS, GENESIS_ID } from "./plan";
import { startPage } from "./web3/rpcMeter";
import { invalidateReads } from "./web3/cache";
import { getHomeData, getRankData } from "./web3/reads";
import { register } from "./web3/intereacts/register";
import { header } from "./componants/header";
import { userInfo, referralLink } from "./componants/userInfo";
import { registerCard } from "./componants/registerCard";
import { matrixRow, legendBar } from "./componants/matrixOverview";
import { rankDetail } from "./componants/rankDetail";
import { footer, loading } from "./componants/footer";
import { notify } from "./componants/notify";

const app = document.querySelector("#app");
const REF_KEY = "infinity.referrer";

let wallet;
let lastData;
let paintId = 0;

/* ------------------------------------ test mode */

// Dev tools live in /dev and load only when that folder exists and VITE_CHAIN=local.
// Production builds never include them, and /dev can be left out of a production copy entirely.
const loadDev = Object.values(IS_LOCAL ? import.meta.glob("/dev/web/devMode.js") : {})[0];

let dev = null;
const devReady = loadDev
    ? loadDev().then((m) => {
        dev = m.install({ refresh, notify, invalidateReads, data: () => lastData });
    }).catch((err) => console.error("test mode failed to load", err))
    : Promise.resolve();

const activeWallet = () => (dev ? dev.wallet(wallet) : wallet);

/* ------------------------------------ referral */

const isUserId = (value) => /^[1-9]\d{0,9}$/.test(String(value ?? ""));

/** A ?ref=<id> link replaces the saved referrer; otherwise the saved one (or genesis) stays */
function resolveReferrer() {
    const fromUrl = new URLSearchParams(location.search).get("ref");
    if (isUserId(fromUrl)) {
        try { localStorage.setItem(REF_KEY, fromUrl); } catch {}
        return Number(fromUrl);
    }
    try {
        const saved = localStorage.getItem(REF_KEY);
        if (isUserId(saved)) return Number(saved);
    } catch {}
    return GENESIS_ID;
}

let referrer = resolveReferrer();

/* ------------------------------------ routing */

// #/m/<matrix>/r/<rank>[/s/<spot>] opens one rank in full; anything else is home
const route = () => {
    const match = location.hash.match(/^#\/m\/(\d+)\/r\/(\d+)(?:\/s\/(\d+))?/);
    const matrix = Number(match?.[1] ?? 0);
    const rank = Number(match?.[2] ?? 0);
    if (!MATRICES.includes(matrix) || !RANKS.includes(rank)) return { view: "home" };
    return { view: "rank", matrix, rank, spot: Number(match[3] ?? 0) };
};

/* ------------------------------------ render */

const home = (data) => {
    if (!data?.user?.isRegistered) return registerCard(data);
    return userInfo(data) + legendBar + MATRICES.map((m) => matrixRow(data, m)).join("");
};

const paint = (body, data = lastData) => {
    if (!app) return;
    // The header follows the live wallet, even while the page data is still loading
    app.innerHTML = header({ ...data, wallet: activeWallet() }) + body + footer + (dev ? dev.panel(data) : "");
};

async function refresh({ quiet = false } = {}) {
    // A slow read for an old route must not overwrite a newer page
    const id = ++paintId;
    const r = route();
    startPage(r.view === "rank" ? `rank M${r.matrix} R${r.rank}${r.spot ? ` #${r.spot}` : ""}` : "home");
    if (!quiet) paint(loading);

    try {
        const current = activeWallet();
        const data = r.view === "rank"
            ? await getRankData(current, referrer, r.matrix, r.rank, r.spot)
            : await getHomeData(current, referrer);
        if (id !== paintId) return;
        lastData = data;
        paint(r.view === "rank" ? rankDetail(data) : home(data), data);
    } catch (err) {
        console.error(err);
        if (id !== paintId) return;
        const hint = dev ? await dev.downMessage() : null;
        paint(/*html*/`<p class="mx-auto mt-16 max-w-md px-4 text-center text-sm text-sky-100">${hint ?? "Could not load data from the chain. Check your connection and refresh."}</p>`);
    }
}

box.safeRenderApp(async (state) => {
    await devReady;
    wallet = state;
    await refresh();
});

window.addEventListener("hashchange", refresh);

/* ------------------------------------ handlers */

window.connectWallet = () => modal.open();

window.goHome = () => { location.hash = "#/"; };

window.openRank = (matrix, rank) => { location.hash = `#/m/${matrix}/r/${rank}`; };

window.openSpot = (id) => {
    const r = route();
    if (r.view !== "rank") return;
    location.hash = `#/m/${r.matrix}/r/${r.rank}/s/${id}`;
};

window.useGenesis = () => {
    referrer = GENESIS_ID;
    try { localStorage.setItem(REF_KEY, String(GENESIS_ID)); } catch {}
    refresh();
};

/** Copies the text a button carries in data-copy and confirms on the button itself */
window.copyFrom = async (btn) => {
    const text = btn?.dataset?.copy ?? "";
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const input = btn?.parentElement?.querySelector("input");
        input?.select();
        document.execCommand?.("copy");
    }
    const label = btn.textContent;
    btn.textContent = "Copied";
    setTimeout(() => { btn.textContent = label; }, 1500);
};

window.copyLink = async () => {
    const link = referralLink(lastData?.user?.id ?? GENESIS_ID);
    const btn = document.querySelector("[data-copy-btn]");
    try {
        await navigator.clipboard.writeText(link);
    } catch {
        // Clipboard API needs a secure context; fall back to selecting the field
        document.querySelector("#ref-link")?.select();
        document.execCommand?.("copy");
    }
    if (btn) {
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy"; }, 1500);
    }
};

window.registerNow = async () => {
    const connected = await box.getCurrentState();
    const current = connected?.address ? connected : activeWallet();
    startPage("register tx");

    try {
        notify.pending({ stage: "checking" });
        const receipt = await register(current, referrer, { onStep: notify.pending });
        notify.success({ hash: receipt?.transactionHash ?? receipt?.hash });
        await refresh();
    } catch (err) {
        console.error(err);
        notify.error(err);
    }
};
