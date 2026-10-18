import { priceOf } from "../plan";

const KINDS = [
    { label: "Genesis", tone: "bg-amber-400 text-blue-950" },
    { label: "Join",    tone: "bg-sky-600 text-white" },
    { label: "Uprank",  tone: "bg-yellow-300 text-blue-950" },
    { label: "Reborn",  tone: "bg-blue-700 text-white" },
    { label: "Newborn", tone: "bg-emerald-600 text-white" },
];

// Matches relationOf() in the contract: who brought this spot's owner in, as seen by the viewer
const RELATIONS = [
    { key: "outside", label: "Outside team",  detail: "Placed by someone outside your team", fill: "#64748b", dot: "bg-slate-500" },
    { key: "self",    label: "You",           detail: "Your own spot",                       fill: "#f59e0b", dot: "bg-amber-500" },
    { key: "direct",  label: "Your referral", detail: "You referred this member",            fill: "#dc2626", dot: "bg-red-600" },
    { key: "team",    label: "Team referral", detail: "Referred by someone in your team",    fill: "#2563eb", dot: "bg-blue-600" },
];

// Every slot pays into rank wallets; spots come from wallets, not from a particular slot
const SLOTS = [ "Slot 1", "Slot 2", "Slot 3" ];

const LINE = "#dc2626";
const EMPTY = "#7dd3fc";

const kindOf = (kind) => KINDS[kind] ?? KINDS[1];
const relationOf = (relation) => RELATIONS[relation] ?? RELATIONS[0];
const filledCount = (nodes) => (Array.isArray(nodes) ? nodes.slice(1).filter((n) => n.id > 0).length : 0);

/** How many spots under the root each relation fills, for the summary line under a tree */
const relationCounts = (nodes) => {
    const counts = [ 0, 0, 0, 0 ];
    (Array.isArray(nodes) ? nodes.slice(1) : []).forEach((n) => { if (n.id > 0) counts[n.relation] = (counts[n.relation] ?? 0) + 1; });
    return counts;
};

/** Slot positions for root, 3 children and 9 grandchildren */
const layout = ({ width, rootY, childY, grandY, childGap, grandGap }) => {
    const mid = width / 2;
    const points = [ { x: mid, y: rootY, parent: -1 } ];
    for (let c = 0; c < 3; c++) points.push({ x: mid + (c - 1) * childGap, y: childY, parent: 0 });
    for (let c = 0; c < 3; c++) {
        for (let g = 0; g < 3; g++) {
            points.push({ x: points[1 + c].x + (g - 1) * grandGap, y: grandY, parent: 1 + c });
        }
    }
    return points;
};

const edges = (nodes, points) => points.slice(1).map((p, i) => {
    const from = points[p.parent];
    const isFilled = nodes?.[i + 1]?.id > 0;
    return /*html*/`<line x1="${from.x}" y1="${from.y}" x2="${p.x}" y2="${p.y}"
        stroke="${isFilled ? LINE : EMPTY}" stroke-width="${isFilled ? 2.5 : 1.5}" stroke-opacity="${isFilled ? 0.55 : 1}"
        ${isFilled ? "" : `stroke-dasharray="4 4"`} stroke-linecap="round" />`;
}).join("");

const ball = ({ x, y, r, node, label = "", fontSize = 12 }) => {
    if (!(node?.id > 0)) {
        return /*html*/`<circle cx="${x}" cy="${y}" r="${r}" fill="#e0f2fe" stroke="${EMPTY}" stroke-width="1.5" stroke-dasharray="4 3" />`;
    }
    const rel = relationOf(node.relation);
    return /*html*/`
        <circle cx="${x}" cy="${y}" r="${r}" fill="${rel.fill}" stroke="#ffffff" stroke-width="2" />
        <ellipse cx="${x}" cy="${y - r * 0.42}" rx="${r * 0.55}" ry="${r * 0.28}" fill="#ffffff" opacity="0.22" />
        ${label ? `<text x="${x}" y="${y + fontSize * 0.36}" text-anchor="middle" font-size="${fontSize}" font-weight="800" fill="#ffffff">${label}</text>` : ""}
    `;
};

/** Colour key shared by the home page and the rank page */
const relationLegend = /*html*/`
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium">
        ${[ 1, 2, 3, 0 ].map((i) => /*html*/`
        <span class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded-full ${RELATIONS[i].dot} ring-2 ring-white"></span>${RELATIONS[i].label}
        </span>`).join("")}
        <span class="flex items-center gap-1.5">
            <span class="h-3 w-3 rounded-full border border-dashed border-sky-400 bg-sky-100"></span>Open
        </span>
    </div>
`;

/**
 * Small tree for the home page: root, children and grandchildren, no interaction.
 */
const miniTree = (nodes, { matrix, rank }) => {
    const points = layout({ width: 300, rootY: 24, childY: 76, grandY: 122, childGap: 100, grandGap: 29 });
    const price = priceOf(matrix, rank);

    const balls = points.map((p, i) => {
        const isGrand = i > 3;
        return ball({
            x: p.x,
            y: p.y,
            r: i === 0 ? 18 : isGrand ? 9.5 : 15,
            node: nodes?.[i],
            label: isGrand ? "" : String(price),
            fontSize: i === 0 ? 13 : 11,
        });
    }).join("");

    return /*html*/`
        <svg viewBox="0 0 300 140" class="h-auto w-full" role="img" aria-label="R${rank} tree, ${filledCount(nodes)} of 12 places filled">
            ${edges(nodes, points)}
            ${balls}
        </svg>
    `;
};

/**
 * Full tree for the rank page. Each filled spot is clickable and shows its detail panel.
 */
const detailTree = (nodes, { matrix, rank, selected }) => {
    // Kept narrow so the labels stay readable when the tree shrinks to phone width
    const points = layout({ width: 520, rootY: 70, childY: 186, grandY: 288, childGap: 172, grandGap: 55 });
    const price = priceOf(matrix, rank);

    const slotTags = points.slice(1, 4).map((p, c) => /*html*/`
        <rect x="${p.x - 34}" y="${p.y - 56}" width="68" height="18" rx="9" fill="${c === 0 ? "#bae6fd" : c === 1 ? "#fde047" : "#1d4ed8"}" />
        <text x="${p.x}" y="${p.y - 43}" text-anchor="middle" font-size="10" font-weight="700" letter-spacing="0.08em"
            fill="${c === 2 ? "#ffffff" : "#172554"}">${SLOTS[c].toUpperCase()}</text>
    `).join("");

    const balls = points.map((p, i) => {
        const node = nodes?.[i];
        const isGrand = i > 3;
        const r = i === 0 ? 30 : isGrand ? 20 : 25;
        const body = ball({ x: p.x, y: p.y, r, node, label: String(price), fontSize: i === 0 ? 18 : isGrand ? 12 : 15 });
        if (!(node?.id > 0)) return body;

        return /*html*/`
            <g data-node="${node.id}" onclick="selectSpot(${node.id})" role="button" tabindex="0"
                aria-label="Spot ${node.id}, ${relationOf(node.relation).label}"
                onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectSpot(${node.id}); }">
                <circle data-node-ring cx="${p.x}" cy="${p.y}" r="${r + 7}" fill="none" stroke="#1e3a8a" stroke-width="3"
                    class="${node.id === selected ? "" : "opacity-0"} transition-opacity" />
                ${body}
                <text x="${p.x}" y="${i === 0 ? p.y - r - 13 : p.y + r + 16}" text-anchor="middle" font-size="12" font-weight="700" fill="#1e3a8a"
                    stroke="#ecfeff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">#${node.id}</text>
            </g>
        `;
    }).join("");

    return /*html*/`
        <svg viewBox="0 0 520 330" class="h-auto w-full select-none" role="img" aria-label="R${rank} tree from spot ${nodes?.[0]?.id ?? 0}">
            ${edges(nodes, points)}
            ${slotTags}
            ${balls}
        </svg>
    `;
};

export { KINDS, RELATIONS, SLOTS, kindOf, relationOf, filledCount, relationCounts, relationLegend, miniTree, detailTree };
