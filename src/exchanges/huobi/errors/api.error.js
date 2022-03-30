const ZenfuseBaseError = require('../../../base/errors/base.error');

class HuobiApiError extends ZenfuseBaseError {
    /**
     * @param {*} res
     * @param {import('got').HTTPError} err
     */
    constructor(res, err) {
        if (res) {
            super(res['err-msg']);
            this.response = res;
            this.httpError = err;
        } else {
            super(err.response.body['err-msg']);
            this.response = err.response.body;
            this.httpError = err;
        }
    }
}

module.exports = HuobiApiError;
