import Binance from './exchanges/binance/index.js';
import Huobi from './exchanges/huobi/index.js';
import Bitglobal from './exchanges/bitglobal/index.js';
import OKX from './exchanges/okx/index.js';

import ExchangeBaseException from './base/errors/exchange.error.js';
import configurator from './base/conf/configurator.js';

const errorCodes = ExchangeBaseException.errorCodes;
const config = configurator;

export const zenfuse = {
    Binance,
    Huobi,
    Bitglobal,
    OKX,
    ////
    errorCodes,
    config,
};

export default zenfuse;
