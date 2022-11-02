export type OrderParams = import('../../../../base/schemas/orderParams').ZenfuseOrderParams;
export type PlacedOrder = import('../../../../base/schemas/openOrder').PlacedOrder;
/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */
/**
 * Zenfuse -> FTX
 *
 * @param {OrderParams} zOrder Order from
 * @returns {object} Order for ftx api
 */
export function transfromZenfuseOrder(zOrder: OrderParams): object;
/**
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */
/**
 * FTX -> Zenfuse
 *
 * @param {*} fOrder Order from FTX
 * @returns {PlacedOrder} Zenfuse Order
 */
export function transfromFtxOrder(fOrder: any): PlacedOrder;
