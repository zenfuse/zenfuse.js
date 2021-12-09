const Binance = require('./exchanges/binance');

module.exports = {
    Binance,
};

/**
 * @typedef {object} kline
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
