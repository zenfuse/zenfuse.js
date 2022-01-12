export = FtxApiError;
declare class FtxApiError extends BaseConnectorError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    response: unknown;
    httpError: import("got").HTTPError;
}
import BaseConnectorError = require("../../../base/errors/base.error");
