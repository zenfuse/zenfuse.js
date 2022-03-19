/**
 * Zenfuse -> FTX
 *
 * @param {Order} zOrder Order from
 * @returns {object} Order for ftx api
 */
export function transfromZenfuseOrder(zOrder: Order): object;
/**
 * FTX -> Zenfuse
 *
 * @param {*} fOrder Order from FTX
 * @returns {Order} Zenfuse Order
 */
export function transfromFtxOrder(fOrder: any): Order;
