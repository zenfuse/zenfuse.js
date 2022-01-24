/**
 * Zenfuse -> FTX
 *
 * @param {Order} zOrder Order from
 * @returns Order for ftx api
 */
export function transfromZenfuseOrder(zOrder: Order): {
    market: any;
    type: any;
    side: any;
    size: any;
};
/**
 * FTX -> Zenfuse
 *
 * @param {*} fOrder Order from FTX
 * @returns {Order} Zenfuse Order
 */
export function transfromFtxOrder(fOrder: any): Order;
