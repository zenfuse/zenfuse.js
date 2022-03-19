export = ZenfuseBaseError;
declare class ZenfuseBaseError extends Error {
    /**
     * @param {string} msg Error massage
     */
    constructor(msg: string);
}
