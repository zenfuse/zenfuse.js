/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */

/**
 * Zenfuse -> OKX
 *
 * @param {OrderParams} zOrder Order from
 * @returns {object} Order for ftx api
 */
const transformZenfuseOrder = (zOrder) => {
    const TRANSFORM_LIST = [
        'id',
        'side',
        'type',
        'price',
        'quantity',
        'symbol',
    ];

    const xOrder = {
        instId: zOrder.symbol.replace('/', '-'),
        ordId: zOrder.id ? zOrder.id.toString() : undefined,
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
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */

/**
 * OKX -> Zenfuse
 *
 * @param {*} xOrder Order from OKX
 * @returns {PlacedOrder} Zenfuse placed Order
 */
const transformOkxOrder = (xOrder) => {
    /**
     * @type {PlacedOrder}
     */
    const zOrder = {};

    zOrder.id = xOrder.ordId;

    zOrder.timestamp = parseFloat(xOrder.cTime);
    zOrder.symbol = xOrder.instId.replace('-', '/');
    zOrder.type = xOrder.ordType;
    zOrder.side = xOrder.side;
    zOrder.quantity = parseFloat(xOrder.sz);

    if (xOrder.px) {
        zOrder.price = parseFloat(xOrder.px);
    }

    switch (xOrder.state) {
        case 'live':
        case 'partially_filled':
            zOrder.status = 'open';
            break;
        case 'filled':
            zOrder.status = 'close';
            break;
        default:
            zOrder.status = xOrder.state;
    }

    return zOrder;
};

module.exports = {
    transformZenfuseOrder,
    transformOkxOrder,
};
