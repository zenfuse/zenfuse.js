export = ZenfuseBaseError;
declare class ZenfuseBaseError extends Error {
    /**
     * @param {string} msg Error massage
     * @param {string} [code] Optional error code
     */
    constructor(msg: string);
}
