export = BithumbApiError;
declare class BithumbApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError | Promise<Response>} err
     */
    constructor(err: import('got').HTTPError | Promise<Response>);
    response: unknown;
    httpError: HTTPError;
}
import ZenfuseBaseError = require("../../../base/errors/base.error");
import { HTTPError } from "got/dist/source/core";
