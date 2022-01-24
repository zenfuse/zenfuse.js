export type Order = import('../../../../index').Order;
/**
 * Transform market string specialy for Binance
 *
 * @example
 * ```
 * transformMarketString('btc/USDT') // returns'BTCUSDT'
 * ```
 * @param {string} libString Market string from lib interface
 */
export function transformMarketString(libString: string): string;
/**
 * Insert default values for specific order type
 *
 * @important All values should be for zenfuse interface
 * @param {object} order
 * @param {object} defaults
 * @param {object} defaults.limit
 * @param {object} defaults.market
 * @returns TODO: Order type
 */
export function assignDefaultsInOrder(order: object, defaults: {
    limit: object;
    market: object;
}): any;
/**
 * @typedef {import('../../../../index').Order} Order
 */
/**
 * Zenfuse -> Binance
 *
 * @important This function does not assign defaults values
 * @param {Order} zOrder Zenfuse order
 * @returns Order for binance api
 */
export function transfromZenfuseOrder(zOrder: Order): {
    symbol: string;
    type: string;
    side: string;
    price: string;
    quantity: string;
    timeInForce: any;
};
/**
 * Binance -> Zenfuse
 *
 * @param {*} bOrder Order fromf
 * @returns {Order} Zenfuse Order
 */
export function transfromBinanceOrder(bOrder: any): Order;
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
