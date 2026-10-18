import { box, readRpc } from "./connect";
import { InfinityMoney } from "./contracts/contract_infinity";
import { metered } from "./rpcMeter";
import { cachedRead } from "./cache";
import { toHomeView, toRankView } from "./viewParse";
import { GENESIS_ID } from "../plan";

const engine = () => metered(box.createWeb3Contract(InfinityMoney, readRpc()), "Infinity");

const lower = (address) => String(address ?? box.ZERO).toLowerCase();

/**
 * One getHomeView call: account info, USDT balance and allowance, referrer lookup and every matrix tree.
 *
 * @param {string} account
 * @param {number} referrerId
 * @param {object} options  { fresh } skips the cache, e.g. right before a transaction
 * @returns {Promise<object>} parsed view (see viewParse.js)
 */
export async function readHomeView(account, referrerId, { fresh = false } = {}) {
    const refId = Number(referrerId) > 0 ? Number(referrerId) : GENESIS_ID;
    const raw = await cachedRead(
        `home:${lower(account)}:${refId}`,
        () => engine().methods.getHomeView(account ?? box.ZERO, refId).call(),
        { fresh }
    );
    return toHomeView(raw);
}

/**
 * Everything the home page needs, from a single contract read.
 *
 * @param {object} wallet      kitbox wallet state, undefined when not connected
 * @param {number} referrerId  saved referral ID used by the register form
 * @returns {Promise<object>}
 */
export async function getHomeData(wallet, referrerId) {
    const account = wallet?.address ?? box.ZERO;
    const refId = Number(referrerId) > 0 ? Number(referrerId) : GENESIS_ID;
    const view = await readHomeView(account, refId);

    return {
        wallet,
        account,
        isConnected: Boolean(wallet?.address),
        referrer: {
            id: refId,
            address: view.referrerAddress,
            isFound: view.referrerAddress !== box.ZERO,
        },
        totalUsers: view.totalUsers,
        entryPrice: view.entryPrice,
        totalPaid: view.totalPaid,
        usdtBalance: view.usdtBalance,
        user: view.user,
        matrices: view.matrices,
    };
}

/**
 * One rank of one matrix in full, from a single getRankView read.
 *
 * @param {object} wallet
 * @param {number} referrerId  kept so every page data has the same shape
 * @param {number} matrix
 * @param {number} rank
 * @param {number} spotId  spot number in this matrix/rank (#1, #2, ...) to show; 0 means the account's active spot
 * @returns {Promise<object>}
 */
export async function getRankData(wallet, referrerId, matrix, rank, spotId = 0) {
    const account = wallet?.address ?? box.ZERO;
    const raw = await cachedRead(
        `rank:${lower(account)}:${matrix}:${rank}:${spotId}`,
        () => engine().methods.getRankView(account, matrix, rank, spotId).call()
    );
    const view = toRankView(raw);

    return {
        wallet,
        account,
        isConnected: Boolean(wallet?.address),
        referrer: { id: Number(referrerId) || GENESIS_ID },
        usdtBalance: view.usdtBalance,
        user: view.user,
        matrix,
        rank,
        root: view.root,
        holding: view.holding,
        rankWallet: { wallet: view.wallet, price: view.price, matrix, rank },
        nodes: view.nodes,
        details: view.details,
    };
}
