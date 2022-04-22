const ExchangeBaseExeption = require('../../../base/errors/exchange.error');
const utils = require('../utils');

const codes = ExchangeBaseExeption.errorCodes;

/**
 * @see https://binance-docs.github.io/apidocs/spot/en/#error-codes
 */
class BinanceApiExeption extends ExchangeBaseExeption {
    static codesMap = new Map([
        [-1022, codes.INVALID_CREDENTIALS],
        [-2014, codes.INVALID_CREDENTIALS],
        [-2010, codes.INSUFFICIENT_FUNDS],
    ]);

    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err) {
        super(err.response.body.msg);

        const bErrCode = err.response.body.code;

        if (BinanceApiExeption.codesMap.has(bErrCode)) {
            this.code = BinanceApiExeption.codesMap.get(err.response.body.code);
        } else {
            this.code = codes.UNKNOWN_EXEPTION;
        }

        this.response = err.response.body;
        this.httpError = err;

        utils.linkOriginalPayload(this, err.response.body);
    }
}

module.exports = BinanceApiExeption;
