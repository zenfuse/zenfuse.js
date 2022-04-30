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
    get isSocketConnected(): boolean;
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
    [listenKeySymbol]: any;
    [validUntilSymbol]: any;
    [intervalSymbol]: NodeJS.Timer;
}
import ExchangeWebsocketBase = require("./websocketBase");
declare const listenKeySymbol: unique symbol;
declare const validUntilSymbol: unique symbol;
declare const intervalSymbol: unique symbol;
