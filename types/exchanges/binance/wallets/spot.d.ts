export = BinanceSpot;
/**
 * Binance class for spot wallet Api
 * @important should have same
 */
declare class BinanceSpot extends BinanceBase {
    constructor(options?: {});
    /**
     * @returns {string[]} Array of tickers on this exchange
     */
    fetchTickers(): string[];
    /**
     * @returns Array of ticker pairs on this exchange
     */
    fetchMarkets(): Promise<{
        markets: {
            symbol: string;
            baseTicker: string;
            quoteTicker: string;
        };
        originalResponse: any;
    }>;
    /**
     *
     * @note If the symbol is not sent, prices for all symbols will be returned in an array.
     *
     * @param {string} market Ticker pair aka symbol
     * @return Last price
     */
    fetchPrice(market: string): Promise<{
        originalResponse: any;
    }>;
    /**
     * Create new spot order on Binance
     *
     * @param {object} order New order object
     * @param {object} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {'buy'|'sell'} order.side Buy or Sell
     * @param {'market'|'limit'} order.type Market or Limit
     * @param {number|string} order.amount
     * @param {number|string} order.price New order object
     */
    createOrder(order: {
        symbol: object;
        side: 'buy' | 'sell';
        type: 'market' | 'limit';
        amount: number | string;
        price: number | string;
    }): Promise<{
        createdOrder: any;
        originalResponse: any;
    }>;
    /**
     * Cancel an active order
     *
     * @important Binance required order symbol for canceling.
     *      If the symbol did not pass, zenfuse.js makes an additional request 'fetchOpenOrders' to find the required symbol.
     *      So if you know order symbol, better pass it to didn't make unnecessary HTTP requests.
     *
     * @param {object} order Order object to delete
     * @param {string} order.symbol Order ticker pair, for example `BTC/USDT`
     * @param {string} order.id Binance order id
     */
    cancelOrder(order: {
        symbol: string;
        id: string;
    }): Promise<{
        originalResponse: any;
    }>;
    fetchOpenOrders(): Promise<{
        openOrders: any;
        originalResponse: any;
    }>;
    fetchBalances(): Promise<{
        balances: any;
        originalResponse: any;
    }>;
    getAccountDataStream(): AccountDataStream;
    getMarketDataStream(): MarketDataStream;
}
import BinanceBase = require("../base");
import AccountDataStream = require("../streams/accountDataStream");
import MarketDataStream = require("../streams/marketDataStream");
