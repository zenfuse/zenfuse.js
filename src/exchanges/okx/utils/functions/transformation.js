/**
 * Zenfuse -> OKX
 *
 * @param {Order} zOrder Order from
 * @returns {object} Order for ftx api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const xOrder = {
        instId: zOrder.symbol,
        ordType: zOrder.type,
        side: zOrder.side,
        sz: zOrder.quantity,
        tdMode: 'cash',
    };

    if (zOrder.price) {
        xOrder.px = zOrder.price;
    }

    if (zOrder.type === 'market') {
        xOrder.px = null;
    }

    // Allow user extra keys
    for (const [key, value] of Object.entries(zOrder)) {
        if (!TRANSFORM_LIST.includes(key)) {
            xOrder[key] = value;
        }
    }

    return xOrder;
};

/**
 * OKX -> Zenfuse
 *
 * @param {*} fOrder Order from OKX
 * @returns {Order} Zenfuse Order
 */
const transformOkxOrder = (xOrder) => {
    /**
     * @type {Order}
     */
    const zOrder = {};

    zOrder.id = xOrder.ordId.toString();
    zOrder.timestamp = parseFloat(xOrder.cTime);
    zOrder.symbol = xOrder.instId.replace('-', '/');
    zOrder.type = xOrder.ordType;
    zOrder.side = xOrder.side;
    zOrder.quantity = parseFloat(xOrder.sz);
    zOrder.price = xOrder.px ? parseFloat(xOrder.px) : undefined;
    // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

    if (xOrder.state === 'live' || xOrder.state === 'partially_filled') {
        zOrder.status = 'open';
    } 
    else if (xOrder.state === 'filled') {
        zOrder.status = 'close';
    }
    else {
        zOrder.status = xOrder.state;
    }

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformOkxOrder,
};
