export = ZenfuseUserError;
declare class ZenfuseUserError extends ZenfuseBaseError {
    /**
     * Descriptions by error code
     */
    static details: {
        UNSUPPORTED_FEATURE: string;
    };
    /**
     * @param {string} msg message
     * @param {string} code code
     */
    constructor(msg: string, code: string);
    code: string;
    details: any;
}
import ZenfuseBaseError = require("./base.error");
