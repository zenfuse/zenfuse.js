const mergeObjects = require('deepmerge');

const { timeIntervals } = require('../../metadata');

/**
 * Transform market string specialy for FTX
 *
 * @example
 * ```
 * transformMarketString('btc/USDT') // returns'BTCUSDT'
 * ```
 *
 * @param {string} libString Market string from lib interface
 */
const transformMarketString = (libString) => {
    return '' // TODO
};

/**
 * Insert default values for specific order type
 *
 * @important All values should be for zenfuse interface
 *
 * @param {object} order
 * @param {object} defaults
 * @param {object} defaults.limit
 * @param {object} defaults.market
 *
 * @returns TODO: Order type
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
 * Zenfuse -> FTX
 * @important This function does not assign defaults values
 *
 * @param {Order} zOrder Order from
 * @returns Order for FTX api
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
 * FTX -> Zenfuse
 * @param {*} fOrder Order from ftx
 * @returns {Order} Zenfuse Order
 */
const transfromFtxOrder = (fOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = fOrder.orderId.toString();
    zOrder.timestamp = fOrder.transactTime;
    zOrder.status = fOrder.status.toLowerCase();
    // zOrder.timeInForce = bOrder.timeInForce;
    zOrder.type = fOrder.type.toLowerCase();
    zOrder.symbol = fOrder.symbol;
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter
    zOrder.side = fOrder.side.toLowerCase();
    zOrder.price = parseFloat(fOrder.price);
    zOrder.quantity = parseFloat(fOrder.origQty);

    return zOrder;
};

/**
 * Transforms candlestick data from ftx websocket
 *
 * @param {object} k candlestick data from ftx websocket
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
 *
 * @returns {import('../../../../index').Kline} Candlestick data
 */
const transfornCandlestick = (k) => {
    return {
        open: k.o,
        hight: k.h,
        low: k.l,
        close: k.c,
        timestamp: k.t,
        interval: timeIntervals[k.i],
        isClosed: k.x,
        symbol: k.s,
        volume: k.v,
    };
};

module.exports = {
    transformMarketString,
    assignDefaultsInOrder,
    transfromZenfuseOrder,
    transfromFtxOrder,
    transfornCandlestick,
};
