const GLOBAL_CACHE_VALID_TIME = 21_000_000; // 6 hours

class GlobalCacheNamespace {
    /**
     * UNIX Time when cache is updated
     */
    lastUpdateTimestamp = 0;

    get isExpired() {
        return Date.now() - this.lastUpdateTimestamp > GLOBAL_CACHE_VALID_TIME;
    }
}

/**
 * TODO: Rewrite this to class
 *
 * @param {string} namespace
 * @returns {GlobalCacheNamespace}
 */
const getCacheInstance = (namespace) => {
    const cacheSymbol = Symbol.for('zenfuse.globalCache');

    if (!global[cacheSymbol]) {
        global[cacheSymbol] = {};
    }

    if (!global[cacheSymbol][namespace]) {
        global[cacheSymbol][namespace] = new GlobalCacheNamespace();
    }

    return global[cacheSymbol][namespace];
};

module.exports = {
    GlobalCacheNamespace,
    getCacheInstance,
    GLOBAL_CACHE_VALID_TIME,
};
