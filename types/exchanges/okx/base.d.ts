export = OkxBase;
/**
 * Okx base class for method which included in any wallet type
 *
 * **DEV:** Any class what extends ExchangeBase should have same public interface
 */
declare class OkxBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options: import('../../base/exchange').BaseOptions);
    /**
     * @type {OkxCache}
     */
    cache: OkxCache;
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
     * @param {string} url
     * @param {import('http').RequestOptions} options
     * @returns {any}
     */
    privateFetch(url: string, options?: import('http').RequestOptions): any;
    /**
     * Connect to authenticated API
     *
     * @param {object} keys
     * @param {string} keys.publicKey
     * @param {string} keys.privateKey Same as secret key
     * @param {string} keys.additionalKey OKX passphrase
     * @returns {this}
     */
    auth({ publicKey, privateKey, additionalKey }: {
        publicKey: string;
        privateKey: string;
        additionalKey: string;
    }): this;
    /**
     * Is instance has keys to authenticate on not
     *
     * @type {boolean}
     */
    get hasKeys(): boolean;
    /**
     * Ping Okx servers
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
    handleUnexpectedResponse(body: any): any;
    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */
    /**
     * Zenfuse -> OKX
     *
     * @param {OrderParams} zOrder Order from
     * @returns {object} Order for okx api
     */
    transformZenfuseOrder(zOrder: any): object;
    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * OKX -> Zenfuse
     *
     * @param {*} xOrder Order from OKX
     * @returns {PlacedOrder} Zenfuse placed Order
     */
    transformOkxOrder(xOrder: any): any;
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import OkxCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
