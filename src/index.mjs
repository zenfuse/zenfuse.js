import Binance from './exchanges/binance';
import FTX from './exchanges/ftx';
import Bitglobal from './exchanges/bitglobal';
import OKX from './exchanges/okx';

import ExchangeBaseException from './base/errors/exchange.error';
import configurator from './base/conf/configurator';

export default {
    Binance,
    FTX,
    Bitglobal,
    OKX,

    errorCodes: ExchangeBaseException.errorCodes,
    config: configurator,
};
