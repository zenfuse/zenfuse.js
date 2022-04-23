export = BinanceApiExeption;
/**
 * @see https://binance-docs.github.io/apidocs/spot/en/#error-codes
 */
declare class BinanceApiExeption extends ExchangeBaseExeption {
    static codesMap: Map<number, symbol>;
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: symbol;
    response: unknown;
    httpError: import("got").HTTPError;
}
import ExchangeBaseExeption = require("../../../base/errors/exchange.error");
