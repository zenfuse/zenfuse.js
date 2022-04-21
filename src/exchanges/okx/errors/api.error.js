const ZenfuseBaseError = require('../../../base/errors/base.error');

class OkxApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err) {
        super(err.response.body.msg);
        this.response = err.response.body;
        this.httpError = err;
    }
}

module.exports = OkxApiError;
