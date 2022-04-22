const ZenfuseBaseError = require('./base.error');

class ExchangeBaseExeption extends ZenfuseBaseError {
    static errorCodes = {
        INVALID_CREDENTIALS: Symbol('INVALID_CREDENTIALS'),
        INSUFFICIENT_FUNDS: Symbol('INSUFFICIENT_FUNDS'),
        INVALID_ORDER: Symbol('INVALID_ORDER'),
        UNKNOWN_EXEPTION: Symbol('UNKNOWN_EXEPTION'),
    };
}

module.exports = ExchangeBaseExeption;
