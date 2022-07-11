export = BinanceSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 * @typedef {import('../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
 * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PostedOrder
 */
/**
 * Binance class for spot wallet API
 */
declare class BinanceSpot extends BinanceBase {
    /**
     * List of default options
     */
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
     * Post new spot order on Binance
     *
     * @param {OrderParams} zOrder Order parameters
     * @returns {Promise<PostedOrder>}
     */
    postOrder(zOrder: OrderParams): Promise<PostedOrder>;
    /**
     * Cancel an active order
     *
     * @param {OrderParams} zOrder Order to cancel
     */
    cancelOrder(zOrder: OrderParams): Promise<any>;
    /**
     * Cancel an active order
     *
     * **NOTE:** Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
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
    /**
     * Insert default values for specific order type
     *
     * **DEV** All values should be for zenfuse interface
     *
     * @private
     * @param {OrderParams} order
     * @returns {OrderParams}
     */
    private assignDefaultsInOrder;
}
declare namespace BinanceSpot {
    export { BaseOptions, OrderParams, PostedOrder };
}
import BinanceBase = require("../base");
import { timeIntervals } from "../metadata";
type OrderParams = import('../../../base/schemas/orderParams').ZenfuseOrderParams;
type PostedOrder = import('../../../base/schemas/openOrder').PlacedOrder;
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
