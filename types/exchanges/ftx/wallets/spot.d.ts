export = FtxSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * FTX class for spot wallet API
 *
 * @important should have same
 */
declare class FtxSpot extends FtxBase {
    static DEFAULT_OPTIONS: {
        defaults: {
            limit: {};
            market: {};
        };
    };
    /**
     * @param {BaseOptions} options
     */
    constructor(options?: BaseOptions);
    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    fetchTickers(): string[];
    /**
     * @returns {string[]} Array of ticker pairs on FTX
     */
    fetchMarkets(): string[];
    /**
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     * @param {string} market Ticker pair aka symbol
     * @returns Last price
     */
    fetchPrice(market?: string): Promise<any>;
    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     * @typedef {import('../metadata').timeIntervals} timeIntervals
     */
    /**
     * @param {object} params
     * @param {string} params.symbol
     * @param {timeIntervals} params.interval
     * @param {number} [params.startTime]
     * @param {number} [params.endTime]
     * @returns {Promise<Kline[]>}
     */
    fetchCandleHistory(params: {
        symbol: string;
        interval: import("../../..").timeInterval;
        startTime?: number;
        endTime?: number;
    }): Promise<import("../../../base/schemas/kline.js").ZenfuseKline[]>;
    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */
    /**
     * Create new spot order on FTX
     *
     * @param {Order} zOrder Order to create
     */
    createOrder(zOrder: any): Promise<Order>;
    /**
     * Cancel an active order
     *
     * @param {string} orderId Ftx order id
     */
    cancelOrderById(orderId: string): Promise<ZenfuseOrder>;
    fetchOpenOrders(): Promise<void>;
    fetchBalances(): Promise<any>;
    /**
     *
     * @param {string} orderId
     */
    fetchOrderById(orderId: string): Promise<Order>;
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
declare namespace FtxSpot {
    export { BaseOptions };
}
import FtxBase = require("../base");
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
