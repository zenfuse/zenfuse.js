export = OkxSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * OKX class for spot wallet API
 */
declare class OkxSpot extends OkxBase {
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
    createOrder: any;
    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    fetchTickers(): string[];
    /**
     * @returns {string[]} Array of ticker pairs on OKX
     */
    fetchMarkets(): string[];
    /**
     * @typedef {object} PriceObject
     * @property {string} symbol
     * @property {number} price
     */
    /**
     * **NOTE:** If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @returns {PriceObject} Last price
     */
    fetchPrice(market?: string): {
        symbol: string;
        price: number;
    };
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
     * Create new spot order on OKX
     *
     * @param {Order} zOrder Order to create
     */
    postOrder(zOrder: any): Promise<any>;
    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Active Okx order to cancel
     */
    cancelOrder(zOrder: any): Promise<any>;
    /**
     * Cancel an active order
     *
     * @param {string} orderId Okx order id
     */
    cancelOrderById(orderId: string): Promise<import("../../../base/schemas/openOrder").PlacedOrder>;
    fetchBalances(): Promise<any>;
    /**
     *
     * @param {string} orderId
     */
    fetchOrderById(orderId: string): Promise<any>;
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
declare namespace OkxSpot {
    export { BaseOptions };
}
import OkxBase = require("../base");
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
