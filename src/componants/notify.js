import { EXPLORER_TX, IS_LOCAL } from "../web3/connect";

const STAGES = {
    checking:    { title: "Checking",               desc: "Making sure this wallet, its USDT and your referrer are ready." },
    approve:     { title: "Approve USDT",           desc: "Allow the contract to take the 25 USDT entry. Nothing is paid yet." },
    approving:   { title: "Approving",              desc: "Waiting for BSC to confirm the approval." },
    register:    { title: "Confirm in your wallet", desc: "Sign the registration. It pays 25 USDT and places you in R1 of every matrix." },
    registering: { title: "Registering",            desc: "Waiting for BSC to confirm the transaction." },
};

const host = () => document.querySelector("#toast");

let closeTimer;

const show = ({ title, desc, tone, extra = "", canDismiss = true, autoClose = 0 }) => {
    const el = host();
    if (!el) return;
    clearTimeout(closeTimer);
    if (autoClose > 0) closeTimer = setTimeout(() => { el.innerHTML = ""; }, autoClose);
    el.innerHTML = /*html*/`
        <div class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4" role="status" aria-live="polite">
            <div class="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border-2 ${tone} bg-white p-4 text-blue-950 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
                <div class="min-w-0 flex-1">
                    <p class="text-sm font-extrabold">${title}</p>
                    <p class="mt-0.5 text-xs text-blue-900/70">${desc}</p>
                    ${extra}
                </div>
                ${canDismiss ? `<button type="button" onclick="closeToast()" aria-label="Close" class="shrink-0 rounded-lg px-2 text-lg leading-none text-blue-900/60 hover:bg-sky-50">×</button>` : ""}
            </div>
        </div>
    `;
};

/** Wallets report a user cancel as 4001 or ACTION_REJECTED depending on the connector */
const isRejected = (err) => err?.code === 4001 || err?.code === "ACTION_REJECTED" || /user (rejected|denied)/i.test(err?.message ?? "");

const notify = {
    pending(step) {
        const stage = STAGES[step?.stage] ?? STAGES.checking;
        const count = step?.total > 0 && step?.index > 0 ? ` (${step.index}/${step.total})` : "";
        show({ ...stage, title: `${stage.title}${count}`, tone: "border-sky-300", canDismiss: false });
    },
    success({ hash } = {}) {
        show({
            title: "You're registered",
            desc: "Welcome in. Your spots in both matrices are ready.",
            tone: "border-emerald-400",
            autoClose: 6000,
            // The local chain has no explorer, so show the hash instead of a BscScan link
            extra: IS_LOCAL ? `<p class="mt-1 font-mono text-[11px] text-blue-900/60">Local tx ${hash?.slice(0, 18) ?? ""}…</p>` : hash ? `<a href="${EXPLORER_TX}${hash}" target="_blank" rel="noopener" class="mt-1 inline-block text-xs font-bold text-blue-700 underline">View on BscScan</a>` : "",
        });
    },
    info({ title, desc }) {
        show({ title, desc, tone: "border-yellow-400", autoClose: 4000 });
    },
    progress({ title, desc }) {
        show({ title, desc, tone: "border-sky-300", canDismiss: false });
    },
    error(err) {
        show({
            title: isRejected(err) ? "Request cancelled" : "Something went wrong",
            desc: isRejected(err) ? "Nothing was sent. You can try again whenever you're ready." : (err?.message ?? "Please try again."),
            tone: "border-red-400",
        });
    },
    close() {
        const el = host();
        if (el) el.innerHTML = "";
    },
};

if (typeof window !== "undefined") {
    window.closeToast = () => notify.close();
}

export { notify };
