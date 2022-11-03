export type OrderParams = import('../../../../base/schemas/orderParams').ZenfuseOrderParams;
export type PlacedOrder = import('../../../../base/schemas/openOrder').PlacedOrder;
/**
 * Transform market string specialy for Binance
 *
 * @example
 * ```
 * transformMarketString('btc/USDT') // returns'BTCUSDT'
 * ```
 * @param {string} libString Market string from lib interface
 * @returns {string} Binance symbol
 */
export function transformMarketString(libString: string): string;
/**
 * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 */
/**
 * Insert default values for specific order type
 *
 * **DEV** All values should be for zenfuse interface
 *
 * @param {OrderParams} order
 * @param {object} defaults
 * @param {OrderParams} defaults.limit
 * @param {OrderParams} defaults.market
 * @returns {OrderParams}
 */
export function assignDefaultsInOrder(order: OrderParams, defaults: {
    limit: OrderParams;
    market: OrderParams;
}): OrderParams;
/**
 * Zenfuse -> Binance
 *
 * **DEV:** This function does not assign defaults values
 *
 * @param {OrderParams} zOrder Zenfuse order
 * @returns {object} Order for binance api
 */
export function transfromZenfuseOrder(zOrder: OrderParams): object;
/**
 * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
 */
/**
 * Binance -> Zenfuse
 *
 * @param {*} bOrder Order fromf
 * @returns {PlacedOrder} Zenfuse Order
 */
export function transfromBinanceOrder(bOrder: any): PlacedOrder;
/**
 * Transforms candlestick data from binance websocket
 *
 * @param {object} k candlestick data from binance websocket
 * @param {number} k.t Kline start time
 * @param {number} k.T Kline close time
 * @param {string} k.s Symbol
 * @param {string} k.i Interval
 * @param {number} k.f First trade ID
 * @param {number} k.L Last trade ID
 * @param {string} k.o Open price
 * @param {string} k.c Close price
 * @param {string} k.h High price
 * @param {string} k.l Low price
 * @param {string} k.v Base asset volume
 * @param {number} k.n Number of trades
 * @param {boolean} k.x Is this kline closed?
 * @param {string} k.q Quote asset volume
 * @param {string} k.V Taker buy base asset volume
 * @param {string} k.Q Taker buy quote asset volume
 * @param {string} k.B Ignore
 * @returns {import('../../../../index').Kline} Candlestick data
 */
export function transfornCandlestick(k: {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
}): import('../../../../index').Kline;
