/**
 * Zenfuse -> Bithumb
 *
 * @param {Order} zOrder Order from
 * @returns Order for bithumb api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const bOrder = {
        symbol: zOrder.symbol.replace('/', '-'),
        type: zOrder.type,
        side: zOrder.side,
        quantity: zOrder.quantity,
    };

    if (zOrder.price) {
        bOrder.price = zOrder.price;
    }

    if (zOrder.type === 'market') {
        bOrder.price = null;
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
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb
 * @returns {Order} Zenfuse Order
 */
const transformBithumbOrder = (bOrder, zInitialOrder = {}) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = bOrder.data.orderId;
    zOrder.timestamp = bOrder.timestamp;
    if (Object.entries(zInitialOrder).length === 0) {
        if (bOrder.data.status === 'success') {
            zOrder.status = 'close';
        }
        else if (bOrder.data.status === 'send' || bOrder.data.status === 'pending') {
            zOrder.status = 'open';
        }
        else {
            zOrder.status = 'canceled';
        }
        zOrder.symbol = bOrder.data.symbol.replace('-', '/');
        zOrder.type = bOrder.data.type;
        zOrder.side = bOrder.data.side;
        zOrder.price = bOrder.data.price ? parseFloat(bOrder.data.price) : undefined;
        zOrder.quantity = parseFloat(bOrder.data.quantity);
    }
    else {
        zOrder.symbol = zInitialOrder.symbol;
        zOrder.type = zInitialOrder.type;
        zOrder.side = zInitialOrder.side;
        zOrder.quantity = zInitialOrder.quantity;
        zOrder.price = zInitialOrder.price ? zInitialOrder.price : undefined;
        zOrder.status = zInitialOrder.status;
    }
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformBithumbOrder,
};
