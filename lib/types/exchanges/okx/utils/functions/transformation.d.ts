export type OrderParams = import('../../../../base/schemas/orderParams').ZenfuseOrderParams;
export type PlacedOrder = import('../../../../base/schemas/openOrder').PlacedOrder;
/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */
/**
 * Zenfuse -> OKX
 *
 * @param {OrderParams} zOrder Order from
 * @returns {object} Order for ftx api
 */
export function transformZenfuseOrder(zOrder: OrderParams): object;
/**
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */
/**
 * OKX -> Zenfuse
 *
 * @param {*} xOrder Order from OKX
 * @returns {PlacedOrder} Zenfuse placed Order
 */
export function transformOkxOrder(xOrder: any): PlacedOrder;
