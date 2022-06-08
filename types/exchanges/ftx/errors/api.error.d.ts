export = FtxApiException;
declare class FtxApiException extends ExchangeBaseException {
    static codesMap: Map<string, string>;
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: string;
    response: unknown;
    httpError: import("got").HTTPError;
}
import ExchangeBaseException = require("../../../base/errors/exchange.error");
