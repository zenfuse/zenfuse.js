export = BinanceSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * Binance class for spot wallet API
 * @important should have same
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
    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    fetchTickers(): string[];
    /**
     * @returns Array of ticker pairs on this exchange
     */
    fetchMarkets(): Promise<{
        symbol: string;
        baseTicker: string;
        quoteTicker: string;
    }>;
    /**
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
     */
    fetchPrice(market: string): Promise<any>;
    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */
    /**
     * Create new spot order on Binance
     *
     * @param {Order} zOrder Order to create
     */
    createOrder(zOrder: import("../../..").Order): Promise<import("../../..").Order>;
    /**
     * Cancel an active order
     *
     * @important Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      So if you know order symbol, better pass it to didn't make unnecessary HTTP requests.
     *
     * @param {string} orderId Binance order id
     */
    cancelOrderById(orderId: string): Promise<import("../../..").Order>;
    fetchOpenOrders(): Promise<any>;
    fetchBalances(): Promise<any>;
    /**
     *
     * @param {string} orderId
     */
    fetchOrderById(orderId: string): Promise<import("../../..").Order>;
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
declare namespace BinanceSpot {
    export { BaseOptions };
}
import BinanceBase = require("../base");
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
type BaseOptions = import('../../../base/exchange').BaseOptions;
