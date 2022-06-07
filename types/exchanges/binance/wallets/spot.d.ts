export = BinanceSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * Binance class for spot wallet API
 */
declare class BinanceSpot extends BinanceBase {
    static DEFAULT_OPTIONS: {
        defaults: {
            limit: {
                timeInForce: string;
            };
            market: {};
        };
    };
    /**
     * @param {BaseOptions} options
     */
    constructor(options?: BaseOptions);
    createOrder: any;
    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    fetchTickers(): string[];
    /**
     * @returns {string[]} Array of ticker pairs on this exchange
     */
    fetchMarkets(): string[];
    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     * @param {object} params
     * @param {string} params.symbol
     * @param {timeIntervals} params.interval
     * @param {number} [params.startTime]
     * @param {number} [params.endTime]
     * @returns {Kline[]}
     */
    fetchCandleHistory(params: {
        symbol: string;
        interval: timeIntervals;
        startTime?: number;
        endTime?: number;
    }): import("../../../base/schemas/kline.js").ZenfuseKline[];
    /**
     * @typedef {object} PriceObject
     * @property {string} symbol
     * @property {number} price
     */
    /**
     * **DEV:** If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @returns {PriceObject} Price object
     */
    fetchPrice(market: string): {
        symbol: string;
        price: number;
    };
    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */
    /**
     * Create new spot order on Binance
     *
     * @param {Order} zOrder Order to create
     */
    postOrder(zOrder: any): Promise<any>;
    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Order to cancel
     */
    cancelOrder(zOrder: any): Promise<any>;
    /**
     * Cancel an active order
     *
     * **NOTE:** Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      TODO: Make possible to pass symbol from user
     *
     * @param {string} orderId Binance order id
     */
    cancelOrderById(orderId: string): Promise<any>;
    fetchOpenOrders(): Promise<any>;
    fetchBalances(): Promise<any>;
    /**
     * **NOTE:** Binance requires symbol for fetching order.
     *
     * @param {string} orderId
     */
    fetchOrderById(orderId: string): Promise<any>;
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
declare namespace BinanceSpot {
    export { BaseOptions };
}
import BinanceBase = require("../base");
import { timeIntervals } from "../metadata";
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
