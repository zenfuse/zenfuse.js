const mergeObjects = require('deepmerge');

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

module.exports = {
    transformMarketString,
    assignDefaultsInOrder,
    transformOrderValues,
};
