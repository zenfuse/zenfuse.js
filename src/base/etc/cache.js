/**
 * This is global
 */
class BaseGlobalCache {
    static VALID_TIME = 21_000_000; // 6 hours

    /**
     * Created cache namespace, should be the same in diferent instances
     * @type {Map<any, any>}
     */
    globalCache;

    /**
     * @param {string} namespace
     */
    constructor(namespace) {
        const cacheSymbol = Symbol.for('zenfuse.globalCache');

        if (!global[cacheSymbol]) {
            global[cacheSymbol] = {};
        }

        const isNamespaceExists = !!global[cacheSymbol][namespace];

        if (!isNamespaceExists) {
            global[cacheSymbol][namespace] = this.createNamespace();
        }

        this.globalCache = global[cacheSymbol][namespace];
    }

    /**
     * @private
     * @returns {Map<any, any>}
     */
    createNamespace() {
        const namespaceInstance = new Map();

        /**
         * @type {ProxyHandler}
         */
        const updateHandler = {
            apply: (setMethod, globalCache, argumentsList) => {
                globalCache.lastUpdateTimestamp = Date.now();
                return setMethod(...argumentsList);
            },
        };

        namespaceInstance.set = new Proxy(
            namespaceInstance.set.bind(namespaceInstance),
            updateHandler,
        );

        namespaceInstance.lastUpdateTimestamp = 0;

        return namespaceInstance;
    }

    get isExpired() {
        return (
            Date.now() - this.globalCache.lastUpdateTimestamp >
            BaseGlobalCache.VALID_TIME
        );
    }
}

module.exports = BaseGlobalCache;
