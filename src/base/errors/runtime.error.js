class ZenfuseRuntimeError extends Error {
    /**
     * Descriptions by error code
     */
    static details = {
        // TODO: Rename this error code
        // eslint-disable-next-line @cspell/spellchecker
        ZEFU_CACHE_UNSYNC: 'Zenfuse global cache out of sync',
        ZEFU_ORDER_NOT_FOUND: 'Required order not found',
    };

    /**
     * @param {string} msg Error massage
     * @param {string} [code] Optional error code
     */
    constructor(msg, code) {
        super(msg);
        this.code = code;
        this.details = ZenfuseRuntimeError.details[code];
    }
}

module.exports = ZenfuseRuntimeError;
