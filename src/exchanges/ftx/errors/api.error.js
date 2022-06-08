const ExchangeBaseException = require('../../../base/errors/exchange.error');
const utils = require('../../../base/utils/utils');

class FtxApiException extends ExchangeBaseException {
    static codesMap = new Map([
        ['Not logged in: Invalid API key', 'INVALID_CREDENTIALS'],
        ['Invalid signature', 'INVALID_CREDENTIALS'],
        ['Not enough balances', 'INSUFFICIENT_FUNDS'],
    ]);

    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err) {
        const errMsg = err.response.body.error;
        super(errMsg);

        if (FtxApiException.codesMap.has(errMsg)) {
            this.code = FtxApiException.codesMap.get(errMsg);
        } else {
            this.code = 'UNKNOWN_EXCEPTION';
        }

        this.response = err.response.body;
        this.httpError = err;

        utils.linkOriginalPayload(this, err.response.body);
    }
}

module.exports = FtxApiException;
