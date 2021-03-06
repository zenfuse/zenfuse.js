export = ZenfuseRuntimeError;
declare class ZenfuseRuntimeError extends Error {
    /**
     * Descriptions by error code
     */
    static details: {
        ZEFU_CACHE_UNSYNC: string;
        ZEFU_ORDER_NOT_FOUND: string;
    };
    /**
     * @param {string} msg Error massage
     * @param {string} [code] Optional error code
     */
    constructor(msg: string, code?: string);
    code: string;
    details: any;
}
