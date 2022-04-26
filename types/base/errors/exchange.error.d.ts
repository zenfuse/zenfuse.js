export = ExchangeBaseException;
declare class ExchangeBaseException extends ZenfuseBaseError {
    static errorCodes: {
        INVALID_CREDENTIALS: symbol;
        INSUFFICIENT_FUNDS: symbol;
        INVALID_ORDER: symbol;
        UNKNOWN_EXCEPTION: symbol;
    };
}
import ZenfuseBaseError = require("./base.error");
