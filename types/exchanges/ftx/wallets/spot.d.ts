export = FtxSpot;
/**
 * @typedef {import('../../../base/exchange').BaseOptions} BaseOptions
 */
/**
 * FTX class for spot wallet API
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
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
     */
    fetchPrice(market?: string): Promise<any>;
    /**
     * @typedef {import('../utils/functions/transformation').Order} Order
     */
    /**
     * Create new spot order on FTX
     *
     * @param {Order} zOrder Order to create
     */
    createOrder(zOrder: any): Promise<any>;
    /**
     * Cancel an active order
     *
     * @param {object} order Order object to delete
     * @param {string} order.id Ftx order id
     */
    cancelOrder(order: {
        id: string;
    }): Promise<{
        id: string;
    }>;
    fetchOpenOrders(): Promise<any>;
    fetchBalances(): Promise<any>;
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
