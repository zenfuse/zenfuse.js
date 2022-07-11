const { HTTPError } = require('got');
const ExchangeBaseException = require('../../../base/errors/exchange.error');
const utils = require('../../../base/utils/utils');

class BitglobalApiError extends ExchangeBaseException {
    static codesMap = new Map([
        ['9000', 'INVALID_CREDENTIALS'],
        ['9002', 'INVALID_CREDENTIALS'],
        ['9005', 'INVALID_CREDENTIALS'],
        ['9005', 'INVALID_CREDENTIALS'],
        ['20003', 'INSUFFICIENT_FUNDS'],
    ]);

    /**
     * @param {import('got').HTTPError | *} err
     */
    constructor(err) {
        let bErrCode;

        if (err instanceof HTTPError) {
            super(err.response.body.msg);

            bErrCode = err.response.body.code;

            this.response = err.response.body;
            this.httpError = err;
            utils.linkOriginalPayload(this, err.response);
        } else {
            super(err.msg);

            bErrCode = err.code;

            this.response = err;
            utils.linkOriginalPayload(this, err);
        }

        if (BitglobalApiError.codesMap.has(bErrCode)) {
            this.code = BitglobalApiError.codesMap.get(bErrCode);
        } else {
            this.code = 'UNKNOWN_EXCEPTION';
        }
    }
}

module.exports = BitglobalApiError;
