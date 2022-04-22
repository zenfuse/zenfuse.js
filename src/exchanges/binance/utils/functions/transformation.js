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
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */

/**
 * Insert default values for specific order type
 *
 * **DEV** All values should be for zenfuse interface
 *
 * @param {OrderParams} order
 * @param {object} defaults
 * @param {OrderParams} defaults.limit
 * @param {OrderParams} defaults.market
 * @returns {OrderParams}
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
 * Zenfuse -> Binance
 *
 * **DEV:** This function does not assign defaults values
 *
 * @param {OrderParams} zOrder Zenfuse order
 * @returns {object} Order for binance api
 */
const transfromZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = [
        'side',
        'type',
        'price',
        'quantity',
        'symbol',
        'timeInForce',
    ];
    const bOrder = {};

    bOrder.symbol = zOrder.symbol.replace('/', '').toUpperCase();

    if (zOrder.type) {
        bOrder.type = zOrder.type.toUpperCase();
    }

    if (zOrder.side) {
        bOrder.side = zOrder.side.toUpperCase();
    }

    if (zOrder.price) {
        bOrder.price = zOrder.price.toString();
    }

    if (zOrder.quantity) {
        bOrder.quantity = zOrder.quantity.toString();
    }

    if (zOrder.timeInForce) {
        bOrder.timeInForce = zOrder.timeInForce.toUpperCase();
    }

    // Allow user extra keys
    for (const [key, value] of Object.entries(zOrder)) {
        if (!TRANSFORM_LIST.includes(key)) {
            bOrder[key] = value;
        }
    }

    return bOrder;
};

/**
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */

/**
 * Binance -> Zenfuse
 *
 * @param {*} bOrder Order fromf
 * @returns {PlacedOrder} Zenfuse Order
 */
const transfromBinanceOrder = (bOrder) => {
    /**
     * @type {PlacedOrder}
     */
    const zOrder = {};

    zOrder.id = bOrder.orderId.toString();
    zOrder.timestamp = bOrder.transactTime || bOrder.time;
    zOrder.type = bOrder.type.toLowerCase();
    zOrder.side = bOrder.side.toLowerCase();
    zOrder.price = parseFloat(bOrder.price);
    zOrder.quantity = parseFloat(bOrder.origQty);

    switch (bOrder.status) {
        case 'NEW':
        case 'PARTIALLY_FILLED':
            zOrder.status = 'open';
            break;
        case 'FILLED':
            zOrder.status = 'closed';
            break;
        default:
            zOrder.status = 'canceled';
    }

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
    transfromBinanceOrder,
    transfornCandlestick,
};
