export type OrderParams = import('../../../../base/schemas/orderParams').ZenfuseOrderParams;
export type PlacedOrder = import('../../../../base/schemas/openOrder').PlacedOrder;
/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */
/**
 * Zenfuse -> Bithumb
 *
 * @param {OrderParams} zOrder
 * @returns {object} Order for bithumb api
 */
export function transformZenfuseOrder(zOrder: OrderParams): object;
/**
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */
/**
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb REST
 * @param {object} zInitialOrder
 * @returns {PlacedOrder} Zenfuse Order
 */
export function transformBithumbOrder(bOrder: any, zInitialOrder?: object): PlacedOrder;
/**
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb WS
 * @returns {PlacedOrder} Zenfuse Order
 */
export function transformBithumbOrderWS(bOrder: any): PlacedOrder;
