/**
 * Zenfuse -> Huobi
 *
 * @param {Order} zOrder Order from
 * @returns {object} Order for huobi api
 */
const transfromZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const fOrder = {
        market: zOrder.symbol,
        type: zOrder.type,
        side: zOrder.side,
        size: zOrder.quantity,
    };

    if (zOrder.price) {
        fOrder.price = zOrder.price;
    }

    if (zOrder.type === 'market') {
        fOrder.price = null;
    }

    // Allow user extra keys
    for (const [key, value] of Object.entries(zOrder)) {
        if (!TRANSFORM_LIST.includes(key)) {
            fOrder[key] = value;
        }
    }

    return fOrder;
};

/**
 * Huobi -> Zenfuse
 *
 * @param {*} fOrder Order from Huobi
 * @returns {Order} Zenfuse Order
 */
const transfromHuobiOrder = (fOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = fOrder.id.toString();
    zOrder.timestamp = Date.parse(fOrder.createdAt);
    zOrder.symbol = fOrder.market;
    zOrder.type = fOrder.type;
    zOrder.side = fOrder.side;
    zOrder.quantity = parseFloat(fOrder.size);
    zOrder.price = fOrder.price ? parseFloat(fOrder.price) : undefined;
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    if (fOrder.status === 'new') {
        zOrder.status = 'open';
    } else {
        zOrder.status = fOrder.status;
    }

    return zOrder;
};

module.exports = {
    transfromZenfuseOrder,
    transfromHuobiOrder,
};
