class ZenfuseBaseError extends Error {
    /**
     * @param {string} msg Error massage
     */
    constructor(msg) {
        super(msg);
    }
}

module.exports = ZenfuseBaseError;
