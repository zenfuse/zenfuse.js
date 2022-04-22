const ZenfuseBaseError = require('./base.error');

class ZenfuseUserError extends ZenfuseBaseError {
    /**
     * Descriptions by error code
     */
    static details = {
        UNSUPPORTED_FEATURE:
            'This exchange API does not support basic feature which has zenfuse js API',
        NOT_AUTHENTICATED:
            'Instance does not have keys for authentication. Use auth() first for private API usage',
    };

    /**
     * @param {string} msg message
     * @param {string} code code
     */
    constructor(msg, code) {
        super(msg || ZenfuseUserError.details[code]);
        this.code = code;
        this.details = ZenfuseUserError.details[code];
    }
}

module.exports = ZenfuseUserError;
