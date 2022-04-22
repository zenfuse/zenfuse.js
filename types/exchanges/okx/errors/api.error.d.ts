export = OkxApiError;
declare class OkxApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError} err
     */
    constructor(err: import('got').HTTPError);
    response: unknown;
    httpError: import("got").HTTPError;
}
import ZenfuseBaseError = require("../../../base/errors/base.error");
