export = BinanceApiException;
/**
 * @see https://binance-docs.github.io/apidocs/spot/en/#error-codes
 */
declare class BinanceApiException extends ExchangeBaseException {
    static codesMap: Map<number, string>;
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: string;
    response: unknown;
    httpError: import("got").HTTPError;
}
import ExchangeBaseException = require("../../../base/errors/exchange.error");
