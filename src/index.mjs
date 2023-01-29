import Binance from './exchanges/binance';
import Bitglobal from './exchanges/bitglobal';
import OKX from './exchanges/okx';

import ExchangeBaseException from './base/errors/exchange.error';
import configurator from './base/conf/configurator';

/**
 * @enum
 */
module.exports = {
    Binance,
    Bitglobal,
    OKX,

    errorCodes: ExchangeBaseException.errorCodes,
    config: configurator,
};
