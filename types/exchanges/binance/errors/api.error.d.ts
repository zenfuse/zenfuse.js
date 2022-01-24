export = BinanceApiError;
declare class BinanceApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    code: any;
    response: unknown;
    httpError: import("got").HTTPError;
}
import ZenfuseBaseError = require("../../../base/errors/base.error");
