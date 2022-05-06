export = BinanceBase;
/**
 * Binance base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
declare class BinanceBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options: import('../../base/exchange').BaseOptions);
    /**
     * @type {BinanceCache}
     */
    cache: BinanceCache;
    signatureEncoding: string;
    /**
     * Make http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    publicFetch(url: URL, options?: import('http').RequestOptions): object;
    /**
     * Make authenticated http request based on constructor settings
     *
     * @param {URL} url
     * @param {import('http').RequestOptions} options
     * @returns {object};
     */
    privateFetch(url: URL, options?: import('http').RequestOptions): object;
    /**
     * Connect to authentificated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey Same as secret key
     * @returns {this}
     */
    auth({ publicKey, privateKey }: {
        publicKey: string;
        privateKey: string;
    }): this;
    /**
     * Is instanse has keys to authenticate on not
     *
     * @type {boolean}
     */
    get hasKeys(): boolean;
    /**
     * Ping binance servers
     *
     * @public
     */
    public ping(): Promise<any>;
    /**
     * @private
     */
    private throwIfNotHasKeys;
    /**
     * @param {Error} err
     * @private
     */
    private handleFetcherError;
    /**
     * Parses Binance symbol using cache
     *
     * @param {string} bSymbol Binance symbol without separator
     * @returns {string} Normal symbol with separator
     */
    parseBinanceSymbol(bSymbol: string): string;
    /**
     * @param {Array} symbols Array of symbols from `api/v3/exchangeInfo`
     * @returns {string[]} Array of tickers like `['BTC', 'BUSD'...]`
     */
    extractTickersFromSymbols(symbols: any[]): string[];
    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */
    /**
     * Insert default values for specific order type
     *
     * **DEV** All values should be for zenfuse interface
     *
     * @param {OrderParams} order
     * @param {object} defaults
     * @param {OrderParams} defaults.limit
     * @param {OrderParams} defaults.market
     * @returns {OrderParams}
     */
    assignDefaultsInOrder(order: any, defaults: {
        limit: any;
        market: any;
    }): any;
    /**
     * Zenfuse -> Binance
     *
     * **DEV:** This function does not assign defaults values
     *
     * @param {OrderParams} zOrder Zenfuse order
     * @returns {object} Order for binance api
     */
    transformZenfuseOrder(zOrder: any): object;
    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Binance -> Zenfuse
     *
     * @param {*} bOrder Order fromf
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBinanceOrder(bOrder: any): any;
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import BinanceCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
