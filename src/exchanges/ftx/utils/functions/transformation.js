/**
 * Zenfuse -> FTX
 *
 * @param {Order} zOrder Order from
 * @returns Order for ftx api
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

    // Allow user extra keys
    for (const [key, value] of Object.entries(zOrder)) {
        if (!TRANSFORM_LIST.includes(key)) {
            fOrder[key] = value;
        }
    }

    return fOrder;
};

/**
 * FTX -> Zenfuse
 * @param {*} fOrder Order from FTX
 * @returns {Order} Zenfuse Order
 */
 const transfromFtxOrder = (fOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = fOrder.id.toString();
    zOrder.timestamp = Date.parse(fOrder.createdAt);
    zOrder.symbol = fOrder.market;
    zOrder.status = fOrder.status;
    zOrder.type = fOrder.type;
    zOrder.side = fOrder.side;
    zOrder.quantity = parseFloat(fOrder.size);
    zOrder.price = parseFloat(fOrder.price);
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    return zOrder;
};

module.exports = {
    transfromZenfuseOrder,
    transfromFtxOrder
};
