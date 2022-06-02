export = BithumbBase;
/**
 * Bithumb base class for method which included in any wallet type
 */
declare class BithumbBase extends ExchangeBase {
    /**
     * @param {import('../../base/exchange').BaseOptions} options User defined options for in http client lib
     */
    constructor(options: import('../../base/exchange').BaseOptions);
    /**
     * @type {BithumbCache}
     */
    cache: BithumbCache;
    msgNo: number;
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
     * @returns {this}
     */
    auth({ publicKey, privateKey }: {
        publicKey: string;
        privateKey: string;
    }): this;
    /**
     * Is instance has keys to authenticate on not
     *
     * @type {boolean}
     */
    get hasKeys(): boolean;
    /**
     * Ping bithumb servers
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
    handleUnexpectedResponse(response: any): any;
    createHmacSignatureBithumb(sigParams: any, privateKey: any, encoding: any): string;
    /**
     * @typedef {import('../../../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */
    /**
     * Zenfuse -> Bithumb
     *
     * @param {OrderParams} zOrder
     * @returns {object} Order for bithumb api
     */
    transformZenfuseOrder(zOrder: any): object;
    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Bithumb -> Zenfuse
     *
     * @param {*} bOrder Order from Bithumb REST
     * @param {object} zInitialOrder
     * @returns {PlacedOrder} Zenfuse Order
     */
    transformBithumbOrder(bOrder: any, zInitialOrder?: object): any;
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import BithumbCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
