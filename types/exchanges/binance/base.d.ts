export = BinanceBase;
/**
 * Binance base class for method which included in any wallet type
 *
 * @important Any class what extends ExchangeBase should have same public interface
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
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import BinanceCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
