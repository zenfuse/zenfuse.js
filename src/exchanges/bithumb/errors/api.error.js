const { HTTPError } = require('got');
const ZenfuseBaseError = require('../../../base/errors/base.error');

class BithumbApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError | Promise<Response>} err
     */
    constructor(err) {
        if (err instanceof HTTPError) {
            super(err.response.body.error);
            this.response = err.response.body;
            this.httpError = err;
        }
        else {
            super(err.msg);
            this.response = err;
        }
    }
}

module.exports = BithumbApiError;
