/*
 * Turns getHomeView / getRankView results into the plain objects the components render.
 * Works on web3-decoded structs (named + numeric keys, bigint values).
 * No imports, so the parity test can run it in Node.
 */

const ZERO = "0x0000000000000000000000000000000000000000";

const num = (value) => Number(value ?? 0);
const big = (value) => BigInt(value ?? 0);
const list = (value) => (Array.isArray(value) ? value : []);

const toUser = (u) => ({
    isRegistered: Boolean(u?.registered),
    id: num(u?.id),
    referrer: u?.referrer ?? ZERO,
    referrerId: num(u?.referrerId),
    ranks: list(u?.ranks).map(num),
    income: big(u?.income),
    joinedAt: num(u?.joinedAt),
    directs: num(u?.directs),
    presale: big(u?.presale),
    fee: big(u?.fee),
    treasurySlots: num(u?.treasurySlots),
});

// Spots are numbered per matrix/rank (#1, #2, ...), so the app uses that number as the spot id.
// The contract's system-wide storage id stays available as uid.
const toNode = (n) => ({
    id: num(n?.no),
    uid: num(n?.id),
    account: n?.account ?? ZERO,
    ownerId: num(n?.ownerId),
    ownerDirects: num(n?.ownerDirects),
    overhead: num(n?.overheadNo),
    where: num(n?.where),
    step: num(n?.step),
    kind: num(n?.kind),
    createdAt: num(n?.createdAt),
    relation: num(n?.relation),
    children: num(n?.children),
});

const toNodes = (nodes) => Array.from({ length: 13 }, (_, i) => toNode(list(nodes)[i]));

/** Home and register pages */
const toHomeView = (v) => {
    const matrices = {};
    list(v?.lanes).forEach((lane) => {
        const matrix = num(lane?.matrix);
        const rank = num(lane?.level);
        matrices[matrix] ??= {};
        matrices[matrix][rank] = {
            walk: num(lane?.walk),
            current: num(lane?.currentNo),
            spotCount: num(lane?.spotCount),
            root: num(lane?.rootNo),
            wallet: big(lane?.wallet),
            price: big(lane?.price),
            nodes: toNodes(lane?.nodes),
        };
    });

    return {
        totalUsers: num(v?.totalUsers),
        entryPrice: big(v?.entryPrice),
        totalPaid: big(v?.totalPaid),
        usdtBalance: big(v?.usdtBalance),
        usdtAllowance: big(v?.usdtAllowance),
        referrerAddress: v?.referrerAddress ?? ZERO,
        user: toUser(v?.user),
        matrices,
    };
};

/** Rank page: the tree plus a detail record per filled node */
const toRankView = (v) => {
    const nodes = toNodes(v?.nodes);
    const details = {};
    nodes.forEach((n) => { if (n.id > 0) details[n.id] = n; });

    return {
        user: toUser(v?.user),
        usdtBalance: big(v?.usdtBalance),
        wallet: big(v?.wallet),
        price: big(v?.price),
        holding: {
            walk: num(v?.walk),
            current: num(v?.currentNo),
            spots: list(v?.spotNos).map(num),
        },
        root: num(v?.rootNo),
        nodes,
        details,
    };
};

export { toUser, toNode, toHomeView, toRankView };
