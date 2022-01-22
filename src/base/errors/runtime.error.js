class ZenfuseRuntimeError extends Error {
    /**
     * Descriptions by error code
     */
    static details = {
        ZEFU_CACHE_UNSYNC: 'Zenfuse global cache unsynced',
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
