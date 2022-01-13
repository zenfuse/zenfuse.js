export = AccountDataStream;
declare class AccountDataStream extends ExchangeWebsocketBase {
    /**
     * Time interval when zenfuse should revalidate listen key
     */
    static REVALIDATE_INTERVAL: number;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    /**
     *
     * @returns {this}
     */
    open(): this;
    /**
     *
     * @returns {this}
     */
    close(): this;
    get isSocketConneted(): boolean;
    /**
     * @private
     */
    private fetchListenKey;
    /**
     * @private
     */
    private createRevalidateInterval;
    /**
     * @private
     */
    private stopInterval;
    /**
     * @private
     */
    private extendListenKey;
    /**
     * @private
     */
    private extendValidityTime;
    _validUntil: number;
    checkSocketIsConneted(): void;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
    /**
     * Transforms websocket order from binance
     * Binance -> Zenfuse
     *
     * @typedef {import('../../..').Order} Order
     * @private
     * @returns {Order} Zenfuse Order
     */
    private transfromWebsocketOrder;
    [listenKeySymbol]: any;
    [validUntilSymbol]: any;
    [intervalSymbol]: NodeJS.Timer;
}
import ExchangeWebsocketBase = require("./websocketBase");
declare const listenKeySymbol: unique symbol;
declare const validUntilSymbol: unique symbol;
declare const intervalSymbol: unique symbol;
