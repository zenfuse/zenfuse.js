export = FtxApiError;
declare class FtxApiError extends ZenfuseError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    response: unknown;
    httpError: import("got").HTTPError;
}
import ZenfuseError = require("../../../base/errors/base.error");
