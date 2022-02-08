const Binance = require('./exchanges/binance');
const FTX = require('./exchanges/ftx');
const Bithumb = require('./exchanges/bithumb');

/**
 * @enum
 */
module.exports = {
    Binance,
    FTX,
    Bithumb,
    /**
     * Object with lower case names for uid usage
     */
    exchanges: {
        binance: Binance,
        ftx: FTX,
        bithumb: Bithumb,
    },
};

/**
 * @typedef {object} Order
 * @property {string} id
 * @property {number} timestamp
 * @property {'open'|'closed'|'canceled'} status
 * @property {string} symbol
 * @property {'market'|'limit'} type
 * @property {'buy'|'sell'} side
 * @property {number|string} [price] Required for limit orders
 * @property {number|string} quantity
 */

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
