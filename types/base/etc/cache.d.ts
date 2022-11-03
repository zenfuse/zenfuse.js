export = BaseGlobalCache;
/**
 * This is global
 */
declare class BaseGlobalCache {
    static VALID_TIME: number;
    /**
     * @param {string} namespace
     */
    constructor(namespace: string);
    /**
     * Created cache namespace, should be the same in different instances
     *
     * @type {Map<any, any>}
     */
    globalCache: Map<any, any>;
    /**
     * @private
     * @returns {Map<any, any>}
     */
    private createNamespace;
    get isExpired(): boolean;
}
