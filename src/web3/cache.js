/*
 * Short-lived read cache for page views.
 * - Same key while a read is in flight: callers share one request (wallet events often fire twice in a row)
 * - Same key within ttl: served from memory, no RPC call (back/forward between pages)
 * - invalidateReads() after anything that changes chain state (a transaction, test-mode members)
 */

const entries = new Map();

const DEFAULT_TTL = 15_000;

/**
 * @param {string} key
 * @param {() => Promise<any>} load
 * @param {object} options
 * @param {number} options.ttl    ms a result stays valid
 * @param {boolean} options.fresh  skip the cache but still share an in-flight request
 * @returns {Promise<any>}
 */
function cachedRead(key, load, { ttl = DEFAULT_TTL, fresh = false } = {}) {
    const hit = entries.get(key);
    const now = Date.now();

    if (hit?.pending) return hit.pending;
    if (!fresh && hit && now - hit.at < ttl) return Promise.resolve(hit.value);

    const pending = load()
        .then((value) => {
            entries.set(key, { value, at: Date.now() });
            return value;
        })
        .catch((error) => {
            entries.delete(key);
            throw error;
        });

    entries.set(key, { ...hit, pending });
    return pending;
}

function invalidateReads() {
    entries.clear();
}

export { cachedRead, invalidateReads };
