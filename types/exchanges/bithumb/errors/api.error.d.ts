export = BitglobalApiError;
declare class BitglobalApiError extends ExchangeBaseException {
    static codesMap: Map<string, string>;
    /**
     * @param {import('got').HTTPError | *} err
     */
    constructor(err: import('got').HTTPError | any);
    response: any;
    httpError: HTTPError;
    code: string;
}
import ExchangeBaseException = require("../../../base/errors/exchange.error");
import { HTTPError } from "got/dist/source/core";
