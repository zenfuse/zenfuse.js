/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */

/**
 * Zenfuse -> Bithumb
 *
 * @param {OrderParams} zOrder
 * @returns {object} Order for bithumb api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const bOrder = {
        symbol: zOrder.symbol.replace('/', '-'),
        type: zOrder.type,
        side: zOrder.side,
        quantity: zOrder.quantity.toString(),
        timestamp: Date.now().toString(),
    };

    if (zOrder.price) {
        bOrder.price = zOrder.price.toString();
    }

    if (zOrder.type === 'market') {
        bOrder.price = '-1';
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
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb REST
 * @param {object} zInitialOrder
 * @returns {PlacedOrder} Zenfuse Order
 */
const transformBithumbOrder = (bOrder, zInitialOrder = {}) => {
    /**
     * @type {PlacedOrder}
     */
    const zOrder = {};

    // TODO: Refactor this

    zOrder.id = bOrder.data.orderId;
    if (Object.entries(zInitialOrder).length === 0) {
        //if order is not cached
        if (bOrder.data.status === 'success') {
            zOrder.status = 'close';
        } else if (
            bOrder.data.status === 'send' ||
            bOrder.data.status === 'pending'
        ) {
            zOrder.status = 'open';
        } else {
            zOrder.status = 'canceled';
        }
        zOrder.symbol = bOrder.data.symbol.replace('-', '/');
        zOrder.timestamp = bOrder.timestamp;
        zOrder.type = bOrder.data.type;
        zOrder.side = bOrder.data.side;
        zOrder.price = bOrder.data.price
            ? parseFloat(bOrder.data.price)
            : undefined;
        zOrder.quantity = parseFloat(bOrder.data.quantity);
    } else {
        zOrder.symbol = zInitialOrder.symbol;
        zOrder.timestamp = zInitialOrder.timestamp
            ? zInitialOrder.timestamp
            : Date.now();
        zOrder.type = zInitialOrder.type;
        zOrder.side = zInitialOrder.side;
        zOrder.quantity = zInitialOrder.quantity;
        zOrder.price = zInitialOrder.price ? zInitialOrder.price : undefined;
        zOrder.status = zInitialOrder.status ? zInitialOrder.status : 'open';
    }
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    return zOrder;
};

/**
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb WS
 * @returns {PlacedOrder} Zenfuse Order
 */
const transformBithumbOrderWS = (bOrder) => {
    /**
     * @type {PlacedOrder}
     */
    const zOrder = {};

    zOrder.id = bOrder.data.oId;
    zOrder.timestamp = bOrder.timestamp;
    zOrder.symbol = bOrder.data.symbol.replace('-', '/');
    zOrder.type = bOrder.data.type;
    zOrder.side = bOrder.data.side;
    zOrder.quantity = parseFloat(bOrder.data.quantity);
    zOrder.price = parseFloat(bOrder.data.price);
    if (bOrder.data.status === 'fullDealt') {
        zOrder.status = 'close';
    } else if (
        bOrder.data.status === 'created' ||
        bOrder.data.status === 'partDealt'
    ) {
        zOrder.status = 'open';
    } else {
        zOrder.status = 'canceled';
    }
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformBithumbOrder,
    transformBithumbOrderWS,
};
