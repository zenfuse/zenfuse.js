const Binance = require('./exchanges/binance');
const FTX = require('./exchanges/ftx');
const Bitglobal = require('./exchanges/bithumb');
const OKX = require('./exchanges/okx');
const ExchangeBaseException = require('./base/errors/exchange.error');

/**
 * @enum
 */
module.exports = {
    Binance,
    FTX,
    Bitglobal,
    OKX,

    errorCodes: ExchangeBaseException.errorCodes,
    config: require('./base/conf/configurator'),
};

/**
 * @typedef {object} Trade
 * @property {string} id Exchange trade id
 * @property {number} timestamp Time when trade executed
 * @property {number} amount Amount of base currency
 * @property {number} price
 */

/**
 * @typedef {object} Kline
 * @property {number} open
 * @property {number} hight
 * @property {number} close
 * @property {number} timestamp
 * @property {timeInterval} interval
 * @property {boolean} isClosed
 * @property {string} symbol
 */

/**
 * @typedef {'1m'|'3m'|'5m'|'15m'|'30m'|'1h'|'2h'|'4h'|'6h'|'8h'|'12h'|'1d'|'3d'|'1w'|'1M'} timeInterval
 *      m -> minutes; h -> hours; d -> days; w -> weeks; M -> months
 */
