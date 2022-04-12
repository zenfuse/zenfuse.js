const ZenfuseBaseError = require('./base.error');

class ZenfuseUserError extends ZenfuseBaseError {
    /**
     * Descriptions by error code
     */
    static details = {
        UNSUPPORTED_FEATURE:
            'This exchange API does not support basic feature which has zenfuse js API',
    };

    /**
     * @param {string} msg message
     * @param {string} code code
     */
    constructor(msg, code) {
        super(msg);
        this.code = code;
        this.details = ZenfuseUserError.details[code];
    }
}

module.exports = ZenfuseUserError;