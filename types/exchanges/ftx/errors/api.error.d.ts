export = FtxApiException;
declare class FtxApiException extends ExchangeBaseException {
    static codesMap: Map<string, symbol>;
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: symbol;
    response: unknown;
    httpError: import("got").HTTPError;
}
import ExchangeBaseException = require("../../../base/errors/exchange.error");
