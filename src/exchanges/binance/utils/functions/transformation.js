const mergeObjects = require('deepmerge');

const { timeIntervals } = require('../../metadata');

/**
 * Transform market string specialy for Binance
 *
 * @example
 * ```
 * transformMarketString('btc/USDT') // returns'BTCUSDT'
 * ```
 *
 * @param {string} libString Market string from lib interface
 */
const transformMarketString = (libString) => {
    return libString.replace('/', '').toUpperCase();
};

/**
 * Insert default values for specific order type
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

    if (order.type === 'LIMIT') {
        newOrder = mergeObjects(defaults.limit, order);
    }

    if (order.type === 'MARKET') {
        newOrder = mergeObjects(defaults.market, order);
    }

    return newOrder;
};

/**
 * Transforms order object for binance POST `/order` request interface
 * @param {import('../wallets/spot').createOrder}
 */
const transformOrderValues = (order) => {
    const shouldTransform = [
        'side',
        'type',
        'price',
        'amount',
        'symbol',
        'timeInForce',
    ];

    const transformedOrder = {};

    if (order.type) {
        transformedOrder.type = order.type.toUpperCase();
    }

    if (order.side) {
        transformedOrder.side = order.side.toUpperCase();
    }

    if (order.price) {
        transformedOrder.price = order.price.toString();
    }

    if (order.amount) {
        // NOTE: "amount" should be "quantity" for binance
        transformedOrder.quantity = order.amount.toString();
    }

    if (order.timeInForce) {
        transformedOrder.timeInForce = order.timeInForce.toUpperCase();
    }

    transformedOrder.symbol = transformMarketString(order.symbol);

    // Allow user extra keys
    for (const [key, value] of Object.entries(order)) {
        if (!shouldTransform.includes(key)) {
            transformedOrder[key] = value;
        }
    }

    return transformedOrder;
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
    transformOrderValues,
    transfornCandlestick,
};
