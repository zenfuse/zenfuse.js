const ExchangeBaseException = require('../../../base/errors/exchange.error');
const utils = require('../../../base/utils/utils');

const codes = ExchangeBaseException.errorCodes;

class FtxApiException extends ExchangeBaseException {
    static codesMap = new Map([
        ['Not logged in: Invalid API key', codes.INVALID_CREDENTIALS],
        ['Invalid signature', codes.INVALID_CREDENTIALS],
        ['Not enough balances', codes.INSUFFICIENT_FUNDS],
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
            this.code = codes.UNKNOWN_EXCEPTION;
        }

        this.response = err.response.body;
        this.httpError = err;

        utils.linkOriginalPayload(this, err.response.body);
    }
}

module.exports = FtxApiException;
