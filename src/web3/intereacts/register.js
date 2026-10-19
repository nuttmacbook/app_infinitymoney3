import { box, sameAddress } from "../connect";
import { InfinityMoney } from "../contracts/contract_infinity";
import { Tether } from "../contracts/contract_tether";
import { readHomeView } from "../reads";
import { invalidateReads } from "../cache";

/**
 * Pays the entry in USDT and registers under a referrer ID, which places the wallet in R1 of every matrix.
 * Approves USDT first when the allowance is too low.
 *
 * @param {object} wallet      current wallet state ({ address, signer }); the local demo wallet has a signer too
 * @param {number} referrerId  user ID from the referral link (1 is genesis)
 * @param {object} options
 * @param {(step: {stage: string, index: number, total: number}) => void} options.onStep
 *        called before each wallet prompt so the UI can say what is being signed
 * @returns {Promise<object>} the transaction receipt
 */
export async function register(wallet, referrerId, { onStep = () => {} } = {}) {
    const account = wallet?.address ?? box.ZERO;
    const signer = wallet?.signer;
    const refId = Number(referrerId);

    if (!account || account === box.ZERO || !signer) {
        throw new Error("Wallet is not connected.");
    }
    if (!Number.isInteger(refId) || refId < 1) {
        throw new Error("The referral link does not contain a valid ID.");
    }

    onStep({ stage: "checking", index: 0, total: 1 });

    // One fresh read covers every check the contract makes, so the wallet never opens for a call that will revert
    const view = await readHomeView(account, refId, { fresh: true });
    const isMember = view.user.isRegistered;
    const referrer = view.referrerAddress;
    const balance = view.usdtBalance;
    const allowance = view.usdtAllowance;
    if (isMember) throw new Error("This wallet is already registered.");
    if (!referrer || referrer === box.ZERO) throw new Error(`No member has ID ${refId}. Ask for another link or use the genesis referrer.`);
    if (sameAddress(account, referrer)) throw new Error("You cannot use your own referral link.");

    // The entry price comes from the contract so the app never charges a stale amount
    const AMOUNT = view.entryPrice > 0n ? view.entryPrice : 25n * 10n ** 18n;
    if (BigInt(balance ?? 0) < AMOUNT) {
        throw new Error(`Not enough USDT. Registering needs ${Number(AMOUNT / 10n ** 15n) / 1000} USDT in this wallet.`);
    }

    const isApproved = BigInt(allowance ?? 0) >= AMOUNT;

    // Two wallet prompts when approval is still needed, one when it is not
    const total = isApproved ? 1 : 2;

    if (!isApproved) {
        onStep({ stage: "approve", index: 1, total });
        try {
            const usdt = box.createEtherContract(Tether, signer);
            const tx = await usdt.approve(InfinityMoney.address, AMOUNT);
            onStep({ stage: "approving", index: 1, total });
            await tx.wait();
            invalidateReads();
        } catch (error) {
            const handled = box.handleTxError(Tether, error);
            throw normalize(error, handled, "Approval failed. Please try again.");
        }
    }

    onStep({ stage: "register", index: total, total });
    try {
        const value = BigInt(5e14);
        const engine = box.createEtherContract(InfinityMoney, signer);
        const tx = await engine.registerById(refId, { value });
        onStep({ stage: "registering", index: total, total });
        const receipt = await tx.wait();
        // Chain state changed: the next page load must read again instead of serving cached views
        invalidateReads();
        return receipt;
    } catch (error) {
        const handled = box.handleTxError(InfinityMoney, error);
        throw normalize(error, handled, "Registration did not go through.");
    }
}

/** Keeps the wallet's own error code so the UI can tell a rejection from a failure */
function normalize(error, handled, fallback) {
    const message = error?.reason || handled?.raw?.shortMessage || error?.shortMessage || error?.message || fallback;
    const out = new Error(message);
    out.code = error?.code;
    out.cause = error;
    return out;
}
