export = BithumbApiError;
declare class BithumbApiError extends ZenfuseBaseError {
    /**
     * @param {import('got').HTTPError | *} err
     */
    constructor(err: import('got').HTTPError | any);
    response: any;
    httpError: HTTPError;
}
import ZenfuseBaseError = require("../../../base/errors/base.error");
import { HTTPError } from "got/dist/source/core";
