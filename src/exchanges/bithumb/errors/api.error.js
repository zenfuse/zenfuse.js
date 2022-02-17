const ZenfuseBaseError = require('../../../base/errors/base.error');

class BithumbApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err) {
        super(err.response.body.error);
        this.response = err.response.body;
        this.httpError = err;
    }
}

module.exports = BithumbApiError;