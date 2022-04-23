export = ExchangeBaseExeption;
declare class ExchangeBaseExeption extends ZenfuseBaseError {
    static errorCodes: {
        INVALID_CREDENTIALS: symbol;
        INSUFFICIENT_FUNDS: symbol;
        INVALID_ORDER: symbol;
        UNKNOWN_EXEPTION: symbol;
    };
}
import ZenfuseBaseError = require("./base.error");
