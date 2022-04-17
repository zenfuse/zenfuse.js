/**
 * Zenfuse -> OKX
 *
 * @param {Order} zOrder Order from
 * @returns {object} Order for ftx api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = ['side', 'type', 'price', 'quantity', 'symbol'];

    const xOrder = {
        instId: zOrder.symbol.replace('/', '-'),
        clOrdId: zOrder.id,
        ordType: zOrder.type,
        side: zOrder.side,
        sz: zOrder.quantity.toString(),
        tdMode: 'cash',
    };

    if (zOrder.price) {
        xOrder.px = zOrder.price.toString();
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
 * @param xOrder
 * @param zInitialOrder
 * @returns {Order} Zenfuse Order
 */
const transformOkxOrder = (xOrder, zInitialOrder = {}) => {
    /**
     * @type {Order}
     */
    const zOrder = {};
    xOrder = xOrder.data ? xOrder.data[0] : xOrder;

    zOrder.id = xOrder.ordId;
    if (Object.entries(zInitialOrder).length === 0) {
        zOrder.timestamp = parseFloat(xOrder.cTime);
        zOrder.symbol = xOrder.instId.replace('-', '/');
        zOrder.type = xOrder.ordType;
        zOrder.side = xOrder.side;
        zOrder.quantity = parseFloat(xOrder.sz);
        zOrder.price = xOrder.px ? parseFloat(xOrder.px) : undefined;
        // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

        if (xOrder.state === 'live' || xOrder.state === 'partially_filled') {
            zOrder.status = 'open';
        } else if (xOrder.state === 'filled') {
            zOrder.status = 'close';
        } else {
            zOrder.status = xOrder.state;
        }
    } else {
        zOrder.timestamp = zInitialOrder.timestamp
            ? zInitialOrder.timestamp
            : Date.now();
        zOrder.symbol = zInitialOrder.symbol;
        zOrder.type = zInitialOrder.type;
        zOrder.side = zInitialOrder.side;
        zOrder.quantity = parseFloat(zInitialOrder.quantity);
        zOrder.price = zInitialOrder.price
            ? parseFloat(zInitialOrder.price)
            : undefined;
        zOrder.status = zInitialOrder.status ? zInitialOrder.status : 'open';
    }

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformOkxOrder,
};
