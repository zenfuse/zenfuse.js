const ZenfuseBaseError = require('./base.error');

class ExchangeBaseException extends ZenfuseBaseError {
    static errorCodes = {
        INVALID_CREDENTIALS: Symbol('INVALID_CREDENTIALS'),
        INSUFFICIENT_FUNDS: Symbol('INSUFFICIENT_FUNDS'),
        INVALID_ORDER: Symbol('INVALID_ORDER'),
        UNKNOWN_EXCEPTION: Symbol('UNKNOWN_EXCEPTION'),
    };
}

module.exports = ExchangeBaseException;
