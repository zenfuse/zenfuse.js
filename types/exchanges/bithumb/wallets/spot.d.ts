export = BithumbSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * Bithumb class for spot wallet API
 *
 */
declare class BithumbSpot extends BithumbBase {
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
     * @typedef {import('../utils/functions/transformation').Order} Order
     */
    /**
     * Create new spot order on Bithumb
     *
     * @param {Order} zOrder Order to create
     * @returns {Order} zCreatedOrder
     */
    createOrder(zOrder: any): any;
    /**
     * Cancel an active order
     *
     * @param {Order} zOrder Active order to cancel
     */
    cancelOrder(zOrder: any): Promise<import("../../../base/schemas/openOrder").PlacedOrder>;
    /**
     * Cancel an active order
     *
     * @param {string} orderId Bithumb order id
     * @param {string} symbol
     */
    cancelOrderById(orderId: string, symbol?: string): Promise<import("../../../base/schemas/openOrder").PlacedOrder>;
    fetchOpenOrders(): Promise<void>;
    fetchBalances(): Promise<any>;
    /**
     *
     * @param {string} orderId
     * @param {string} symbol
     */
    fetchOrderById(orderId: string, symbol?: string): Promise<import("../../../base/schemas/openOrder").PlacedOrder>;
    /**
     * @typedef {import('../../../base/schemas/kline.js').ZenfuseKline} Kline
     */
    /**
     * **NOTE:** Not stable
     *
     * @see https://github.com/bithumb-pro/bithumb.pro-official-api-docs/issues/78
     * @see https://github.com/bithumb-pro/bithumb.pro-official-api-docs/issues/67
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
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
declare namespace BithumbSpot {
    export { BaseOptions };
}
import BithumbBase = require("../base");
import { timeIntervals } from "../metadata";
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
