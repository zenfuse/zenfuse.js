export = BithumbApiError;
declare class BithumbApiError extends ExchangeBaseExeption {
    static codesMap: Map<string, symbol>;
    /**
     * @param {import('got').HTTPError | *} err
     */
    constructor(err: import('got').HTTPError | any);
    response: any;
    httpError: HTTPError;
    code: symbol;
}
import ExchangeBaseExeption = require("../../../base/errors/exchange.error");
import { HTTPError } from "got/dist/source/core";
