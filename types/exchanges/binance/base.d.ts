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
     * @protected
     * @param {string} bSymbol Cursed Binance symbol without separator
     * @returns {string} Normal symbol with separator
     */
    protected parseBinanceSymbol(bSymbol: string): string;
    /**
     * @typedef {import('../../base/schemas/orderParams').ZenfuseOrderParams} OrderParams
     */
    /**
     * Zenfuse -> Binance
     *
     * **DEV:** This function does not assign defaults values
     *
     * @param {OrderParams} zOrder Zenfuse order parameters
     * @returns {object} Order for binance api
     */
    transformZenfuseOrder(zOrder: import("../../base/schemas/orderParams").ZenfuseOrderParams): object;
    /**
     * @typedef {import('../../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */
    /**
     * Binance -> Zenfuse
     *
     * @param {*} bOrder Order from binance
     * @returns {PlacedOrder} Posted Zenfuse Order
     */
    transformBinanceOrder(bOrder: any): any;
    /**
     * Order modifier for price and quantity. Provide decimal precision context for basic method.
     *
     * @protected
     * @param {OrderParams} zOrder
     * @returns {OrderParams}
     */
    protected preciseOrderValues(zOrder: import("../../base/schemas/orderParams").ZenfuseOrderParams): import("../../base/schemas/orderParams").ZenfuseOrderParams;
    [keysSymbol]: {};
}
import ExchangeBase = require("../../base/exchange");
import BinanceCache = require("./etc/cache");
declare const keysSymbol: unique symbol;
