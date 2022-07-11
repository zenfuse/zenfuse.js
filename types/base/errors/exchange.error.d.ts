export = ExchangeBaseException;
declare class ExchangeBaseException extends ZenfuseBaseError {
    static errorCodes: {
        INVALID_CREDENTIALS: string;
        INSUFFICIENT_FUNDS: string;
        INVALID_ORDER: string;
        UNKNOWN_EXCEPTION: string;
    };
}
import ZenfuseBaseError = require("./base.error");
