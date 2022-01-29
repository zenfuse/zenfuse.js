/**
 * Zenfuse -> Bithumb
 *
 * @param {Order} zOrder Order from
 * @returns Order for bithumb api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const bOrder = {
        market: zOrder.symbol,
        type: zOrder.type,
        side: zOrder.side,
        size: zOrder.quantity,
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
const transformBithumbOrder = (bOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = bOrder.id.toString();
    zOrder.timestamp = Date.parse(bOrder.createdAt);
    zOrder.symbol = bOrder.market;
    zOrder.type = bOrder.type;
    zOrder.side = bOrder.side;
    zOrder.quantity = parseFloat(bOrder.size);
    zOrder.price = bOrder.price ? parseFloat(bOrder.price) : undefined;
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    if (bOrder.status === 'new') {
        zOrder.status = 'open';
    } else {
        zOrder.status = fOrder.status;
    }

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformBithumbOrder,
};
