export = FtxBase;
/**
 * FTX base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
declare class FtxBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options: import('../../base/exchange').BaseOptions);
    /**
     * @type {FtxCache}
     */
    cache: FtxCache;
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
     * @param {string} url
     * @param {import('http').RequestOptions} options
     * @returns {any}
     */
    privateFetch(url: string, options?: import('http').RequestOptions): any;
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
     * Ping ftx servers
     *
     * @public
     */
    public ping(): Promise<void>;
    /**
     * @private
     */
    private throwIfNotHasKeys;
    /**
     * @param {Error} err
     * @private
     */
    private handleFetcherError;
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import FtxCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
