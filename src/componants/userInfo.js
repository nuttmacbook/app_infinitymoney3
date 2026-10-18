import { shortAddress, formNumber, timestampToUTC } from "../web3/connect";
import { PLAN, GENESIS_ID, PRESALE_PERCENT, FEE_PERCENT, TREASURY_SLOT_AMOUNT } from "../plan";

const referralLink = (id) => `${location.origin}${location.pathname}?ref=${id}`;

const userInfo = (data) => {
    const account = data?.account ?? "";
    const id = Number(data?.user?.id ?? 0);
    const referrerId = Number(data?.user?.referrerId ?? 0);
    const ranks = Array.isArray(data?.user?.ranks) ? data.user.ranks : [];
    const income = formNumber(data?.user?.income ?? 0n, 18, 2);
    const joinedAt = Number(data?.user?.joinedAt ?? 0);
    const joined = joinedAt > 0 ? timestampToUTC(joinedAt).full.slice(0, 10) : "—";
    const link = referralLink(id);
    const directs = Number(data?.user?.directs ?? 0);
    const incomeRaw = BigInt(data?.user?.income ?? 0n);
    const presaleRaw = BigInt(data?.user?.presale ?? 0n);
    const feeRaw = BigInt(data?.user?.fee ?? 0n);
    const treasurySlots = Number(data?.user?.treasurySlots ?? 0);
    const cashRaw = incomeRaw > presaleRaw + feeRaw ? incomeRaw - presaleRaw - feeRaw : 0n;

    const row = ({ label, value }) => /*html*/`
        <div class="flex items-center justify-between gap-3 py-2.5">
            <span class="shrink-0 text-[13px] font-medium text-blue-900/70 sm:text-sm">${label}</span>
            <span class="min-w-0 truncate font-mono text-[13px] font-semibold tabular-nums text-blue-950 sm:text-sm">${value}</span>
        </div>
    `;

    const rankBadge = (matrix, rank) => /*html*/`
        <div class="flex min-w-[6.5rem] flex-1 flex-col items-center gap-1 rounded-2xl bg-white/70 px-3 py-3 ring-1 ring-inset ring-sky-300">
            <span class="text-xs font-bold text-blue-900/70">Matrix ${matrix}</span>
            <span class="rounded-full bg-gradient-to-b from-red-500 to-red-700 px-4 py-0.5 font-mono text-lg font-black tabular-nums text-white ring-2 ring-white">
                R${rank}
            </span>
            <span class="text-[11px] text-blue-900/60">highest rank</span>
        </div>
    `;

    return /*html*/`
    <section class="mx-auto mt-6 w-full max-w-6xl px-4 sm:mt-8 sm:px-6">
        <div class="overflow-hidden rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-sky-50 to-cyan-100 text-blue-950 shadow-[0_12px_40px_-12px_rgba(56,189,248,0.7)]">
            <div class="flex items-center justify-between gap-3 border-b border-sky-200 px-4 py-3 sm:px-6">
                <div class="min-w-0">
                    <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700/70 sm:text-[11px]">User information</p>
                    <h2 class="truncate text-lg font-extrabold leading-tight sm:text-xl">Your account</h2>
                </div>
                <span class="shrink-0 rounded-full bg-blue-700 px-3 py-1 font-mono text-sm font-black tabular-nums text-white">ID ${id}</span>
            </div>

            <div class="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
                <!-- Account details -->
                <div class="min-w-0">
                    <div class="divide-y divide-sky-200">
                        ${row({ label: "Wallet", value: shortAddress(account) })}
                        ${row({ label: "Referrer", value: referrerId === GENESIS_ID ? "Genesis (ID 1)" : `ID ${referrerId} · ${shortAddress(data?.user?.referrer)}` })}
                        ${row({ label: "Direct referrals", value: `${directs} ${directs === 1 ? "member" : "members"}` })}
                        ${row({ label: "Joined", value: joined })}
                        ${row({ label: "M1 R3 slot 2 → treasury", value: `${treasurySlots} ${treasurySlots === 1 ? "time" : "times"} · ${(treasurySlots * TREASURY_SLOT_AMOUNT).toLocaleString("en-US")} USDT` })}
                    </div>

                    <!-- Referral link -->
                    <div class="mt-3 flex items-baseline justify-between gap-2">
                        <label class="text-[13px] font-medium text-blue-900/70 sm:text-sm" for="ref-link">Your referral link</label>
                        <span class="text-[11px] font-semibold text-blue-900/70">Used by <span class="font-mono font-black tabular-nums text-blue-950">${directs}</span> ${directs === 1 ? "member" : "members"}</span>
                    </div>
                    <div class="mt-1.5 flex min-w-0 items-stretch gap-2">
                        <input id="ref-link" readonly value="${link}"
                            class="min-w-0 flex-1 truncate rounded-xl border border-sky-300 bg-white px-3 py-2 font-mono text-xs text-blue-950 sm:text-sm" />
                        <button type="button" onclick="copyLink()" data-copy-btn
                            class="shrink-0 rounded-xl bg-gradient-to-b from-yellow-300 to-amber-400 px-4 text-sm font-extrabold text-blue-950 ring-1 ring-inset ring-amber-500/50 transition hover:brightness-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
                            Copy
                        </button>
                    </div>
                </div>

                <!-- Highest rank per matrix and income -->
                <div class="flex min-w-0 flex-col gap-3">
                    <div class="flex flex-wrap gap-3">
                        ${PLAN.map((p, i) => rankBadge(p.matrix, ranks[i] ?? 0)).join("")}
                    </div>
                    <div class="rounded-2xl bg-yellow-300 px-4 py-3 ring-1 ring-inset ring-amber-500/40">
                        <p class="text-[13px] font-bold text-blue-950/80">Total income</p>
                        <p class="font-mono text-2xl font-black tabular-nums text-blue-950 sm:text-3xl">${income} <span class="text-base font-bold">USDT</span></p>
                        <p class="text-[11px] font-medium text-blue-950/70">Each payout: ${100 - PRESALE_PERCENT - FEE_PERCENT}% in USDT to your wallet, ${PRESALE_PERCENT}% buys partner presale tokens for you, ${FEE_PERCENT}% to the treasury.</p>
                    </div>
                    <div class="divide-y divide-sky-200 rounded-2xl bg-white/70 px-4 ring-1 ring-inset ring-sky-300">
                        ${[
                            [ "USDT to your wallet", cashRaw ],
                            [ "Partner presale tokens", presaleRaw ],
                            [ "Treasury", feeRaw ],
                        ].map(([ label, value ]) => /*html*/`
                        <div class="flex items-center justify-between gap-3 py-2">
                            <span class="min-w-0 text-[12px] font-medium text-blue-900/70">${label}</span>
                            <span class="shrink-0 font-mono text-sm font-black tabular-nums text-blue-950">${formNumber(value, 18, 2)} USDT</span>
                        </div>`).join("")}
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;
};

export { userInfo, referralLink };
