const ZenfuseBaseError = require('./base.error');

class ExchangeBaseExeption extends ZenfuseBaseError {
    static INVALID_CREDENTIALS = Symbol('INVALID_CREDENTIALS');
    static INSUFFICIENT_FUNDS = Symbol('INSUFFICIENT_FUNDS');
    static INVALID_ORDER = Symbol('INVALID_ORDER');
    static OTHER_EXEPTION = Symbol('OTHER_EXEPTION');
}

module.exports = ExchangeBaseExeption;
