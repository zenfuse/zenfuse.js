const ExchangeBaseException = require('../../../base/errors/exchange.error');
const utils = require('../../../base/utils/utils');

/**
 * @see https://www.okx.com/docs-v5/en/#error-code
 */
class OkxApiException extends ExchangeBaseException {
    static codesMap = new Map([
        ['50111', 'INVALID_CREDENTIALS'],
        ['50113', 'INVALID_CREDENTIALS'],
        ['58350', 'INSUFFICIENT_FUNDS'],
        ['51008', 'INSUFFICIENT_FUNDS'],
    ]);

    /**
     * @param {import('got').HTTPError | null} err
     * @param {*} body
     */
    constructor(err, body) {
        if (!body) {
            body = err.response.body;
        }

        let oErrCode;

        if (body.data && body.data[0]) {
            super(body.data[0].sMsg);
            oErrCode = body.data[0].sCode;
        } else {
            oErrCode = body.code;
            super(body.msg);
        }

        if (OkxApiException.codesMap.has(oErrCode)) {
            this.code = OkxApiException.codesMap.get(oErrCode);
        } else {
            this.code = 'UNKNOWN_EXCEPTION';
        }

        this.response = body;

        if (err) {
            this.httpError = err;
        }

        utils.linkOriginalPayload(this, body);
    }
}

module.exports = OkxApiException;
