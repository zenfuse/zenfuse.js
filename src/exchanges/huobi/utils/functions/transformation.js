const mergeObjects = require('deepmerge');

const { timeIntervals } = require('../../metadata');

/**
 * Transform market string specialy for Binance
 *
 * @example
 * ```
 * transformMarketString('btc/USDT') // returns'BTCUSDT'
 * ```
 * @param {string} libString Market string from lib interface
 * @returns {string} Binance symbol
 */
const transformMarketString = (libString) => {
    return libString.replace('/', '').toUpperCase();
};

/**
 * Insert default values for specific order type
 *
 * **DEV** All values should be for zenfuse interface
 *
 * @param {Order} order
 * @param {object} defaults
 * @param {Order} defaults.limit
 * @param {Order} defaults.market
 * @returns {Order} TODO: Order type
 */
const assignDefaultsInOrder = (order, defaults) => {
    let newOrder;

    if (order.type.toLowerCase() === 'limit') {
        newOrder = mergeObjects(defaults.limit, order);
    }

    if (order.type.toLowerCase() === 'market') {
        newOrder = mergeObjects(defaults.market, order);
    }

    return newOrder;
};

/**
 * @typedef {import('../../../../index').Order} Order
 */

/**
 * Zenfuse -> Huobi
 *
 * **DEV:** Doesnt include required account id
 *
 * @param {Order} zOrder Zenfuse order
 * @returns {object} Order for binance api
 */
const transfromZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];
    const hOrder = {};

    hOrder.symbol = zOrder.symbol.replace('/', '').toLowerCase();
    hOrder.amount = zOrder.quantity.toString().toLowerCase();

    if (zOrder.price) {
        hOrder.price = zOrder.price.toString().toLowerCase();
    }

    hOrder.source = 'spot-api';
    hOrder.type = `${zOrder.side}-${zOrder.type}`.toLowerCase();

    // Allow user extra keys
    for (const [key, value] of Object.entries(zOrder)) {
        if (!TRANSFORM_LIST.includes(key)) {
            hOrder[key] = value;
        }
    }

    return hOrder;
};

/**
 * Binance -> Zenfuse
 *
 * @param {*} hOrder Order fromf
 * @returns {Order} Zenfuse Order
 */
const transfromHuobiOrder = (hOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = hOrder.id.toString();
    zOrder.timestamp = hOrder['created-at'];

    switch (hOrder.state) {
        case 'created':
        case 'submitted':
        case 'partial-filled':
            zOrder.status = 'open';
            break;
        case 'filled':
            zOrder.status = 'close';
            break;
        default:
            zOrder.status = 'canceled';
            break;
    }

    zOrder.symbol = hOrder.symbol;

    const [side, type] = hOrder.type.split('-');

    zOrder.side = side;
    zOrder.type = type;
    zOrder.price = parseFloat(hOrder.price);
    zOrder.quantity = parseFloat(hOrder.amount);

    return zOrder;
};

/**
 * Transforms candlestick data from binance websocket
 *
 * @param {object} k candlestick data from binance websocket
 * @param {number} k.t Kline start time
 * @param {number} k.T Kline close time
 * @param {string} k.s Symbol
 * @param {string} k.i Interval
 * @param {number} k.f First trade ID
 * @param {number} k.L Last trade ID
 * @param {string} k.o Open price
 * @param {string} k.c Close price
 * @param {string} k.h High price
 * @param {string} k.l Low price
 * @param {string} k.v Base asset volume
 * @param {number} k.n Number of trades
 * @param {boolean} k.x Is this kline closed?
 * @param {string} k.q Quote asset volume
 * @param {string} k.V Taker buy base asset volume
 * @param {string} k.Q Taker buy quote asset volume
 * @param {string} k.B Ignore
 * @returns {import('../../../../index').Kline} Candlestick data
 */
const transfornCandlestick = (k) => {
    return {
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        timestamp: k.t,
        interval: timeIntervals[k.i],
        isClosed: k.x,
        symbol: k.s,
        volume: parseFloat(k.v),
    };
};

module.exports = {
    transformMarketString,
    assignDefaultsInOrder,
    transfromZenfuseOrder,
    transfromHuobiOrder,
    transfornCandlestick,
};
