export = BinanceApiError;
declare class BinanceApiError extends BaseConnectorError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: any;
    response: unknown;
    httpError: import("got").HTTPError;
}
import BaseConnectorError = require("../../../base/errors/base.error");
