export = AccountDataStream;
declare class AccountDataStream extends ExchangeWebsocketBase {
    _listenKey: any;
    _validUntil: any;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: any;
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
    _interval: NodeJS.Timer;
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
    checkSocketIsConneted(): void;
    serverMessageHandler(msgString: any): void;
    emitOrderUpdateEvent(payload: any): void;
    emitTickersChangedEvent(payload: any): void;
}
import ExchangeWebsocketBase = require("./websocketBase");
