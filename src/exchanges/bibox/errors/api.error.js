const ExchangeBaseException = require("../../../base/errors/exchange.error");
const utils = require("../../../base/utils");

const codes = ExchangeBaseException.errorCodes;

/**
 * @see https://biboxcom.github.io/api/spot/v3/en/?javascript#errors
 */
class BiboxApiException extends ExchangeBaseException {
    static codesMap = new Map([
        [3016, codes.INVALID_CREDENTIALS],
        [3027, codes.INVALID_CREDENTIALS],
    ]);

    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err) {
        super(err.response.body.msg);

        const bErrCode = err.response.body.state;

        if (BiboxApiException.codesMap.has(bErrCode)) {
            this.code = BiboxApiException.codesMap.get(
                err.response.body.state
            );
        } else {
            this.code = codes.UNKNOWN_EXCEPTION;
        }

        this.response = err.response.body;
        this.httpError = err;

        utils.linkOriginalPayload(this, err.response.body);
    }
}

module.exports = BiboxApiException;