/**
 * Zenfuse -> Bithumb
 *
 * @param {Order} zOrder Order from
 * @returns Order for bithumb api
 */
export function transformZenfuseOrder(zOrder: Order): {
    symbol: any;
    type: any;
    side: any;
    quantity: any;
    timestamp: string;
};
/**
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb REST
 * @param {object} zInitialOrder
 * @returns {Order} Zenfuse Order
 */
export function transformBithumbOrder(bOrder: any, zInitialOrder?: object): Order;
/**
 * Bithumb -> Zenfuse
 *
 * @param {*} bOrder Order from Bithumb WS
 * @returns {Order} Zenfuse Order
 */
export function transformBithumbOrderWS(bOrder: any): Order;
