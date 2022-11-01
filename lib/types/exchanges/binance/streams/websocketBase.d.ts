export = ExchangeWebsocketBase;
declare class ExchangeWebsocketBase extends EventEmitter {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance: import('../base'));
    base: import("../base");
    getSocketConnection(path: any): Promise<any>;
    handleConnectionError(err: any): void;
    /**
     * Transforms websocket order from binance
     * Binance -> Zenfuse
     *
     * @param {object} wsOrder
     * @typedef {import('../../..').Order} Order
     * @private
     * @returns {Order} Zenfuse Order
     */
    private transformWebsocketOrder;
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
    transformCandlestick(k: {
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
    }): any;
}
import { EventEmitter } from "events";
