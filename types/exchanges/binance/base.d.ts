export = BinanceBase;
/**
 * Binance base class for method whitch included in any wallet type
 * @important Any class what extends ExchangeBase should have same public interface
 */
declare class BinanceBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options: import('../../base/exchange').BaseOptions);
    _keys: any;
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
    auth(keys: {
        publicKey: string;
        privateKey: string;
    }): this;
    /**
     * Ping binance servers
     */
    ping(): Promise<any>;
    /**
     * @private
     */
    private _checkInstanceHasKeys;
    /**
     *
     * @param {Error} err
     * @private
     */
    private _handleFetcherError;
}
import ExchangeBase = require("../../base/exchange");
