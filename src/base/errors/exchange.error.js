const ZenfuseBaseError = require('./base.error');

class ExchangeBaseException extends ZenfuseBaseError {
    static errorCodes = {
        INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
        INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
        INVALID_ORDER: 'INVALID_ORDER',
        UNKNOWN_EXCEPTION: 'UNKNOWN_EXCEPTION',
    };
}

module.exports = ExchangeBaseException;
