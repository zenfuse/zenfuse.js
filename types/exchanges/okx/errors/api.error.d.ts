export = OkxApiException;
/**
 * @see https://www.okx.com/docs-v5/en/#error-code
 */
declare class OkxApiException extends ExchangeBaseException {
    static codesMap: Map<string, symbol>;
    /**
     * @param {import('got').HTTPError | null} err
     * @param {*} body
     */
    constructor(err: import('got').HTTPError | null, body: any);
    code: symbol;
    response: any;
    httpError: import("got").HTTPError;
}
import ExchangeBaseException = require("../../../base/errors/exchange.error");
