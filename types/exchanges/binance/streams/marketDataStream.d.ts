export = MarketDataStream;
declare class MarketDataStream extends BinanceWebsocketBase {
    lastPayloadId: number;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: import('ws').WebSocket;
    /**
     * Messages that are waiting for a response with a specific id
     *
     * @type {Map<string, [typeof Promise.resolve, typeof Promise.reject]>}
     */
    messageQueue: Map<string, [typeof Promise.resolve, typeof Promise.reject]>;
    /**
     *
     */
    state: {
        watch: Set<any>;
    };
    /**
     * @returns {this}
     */
    open(): this;
    /**
     *
     * @returns {this}
     */
    close(): this;
    subscribeTo(event: any): Promise<void>;
    /**
     * @param {string|WebsocketEvent} event
     */
    unsubscribeFrom(event: string | {
        channel: string;
        symbol: string;
        /**
         * Required if channel is candle
         */
        interval?: string;
    }): Promise<void>;
    /**
     * @private
     * @typedef {object} WebsocketEvent
     * @property {string} channel
     * @property {string} symbol
     * @property {string} [interval] Required if channel is candle
     * @param {WebsocketEvent} event
     * @param {'subscribe'|'unsubscribe'} command
     */
    private editSubscribition;
    unsubscribeFromAllbySymbol(symbol: any): Promise<void>;
    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    private serverMessageHandler;
    /**
     * @fires MarketDataStream#newPrice
     * @param {*} payload
     */
    emitNewPrice(payload: any): void;
    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitCandle(payload: any): void;
    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server responce
     */
    private sendSocketSubscribe;
    /**
     * @private
     * @param  {string[]} eventNames
     * @returns {Promise<object>} Server responce
     */
    private sendSocketUnsubscribe;
    /**
     * @param {object} msg
     * @returns {Promise<object>}
     */
    sendSocketMessage(msg: object): Promise<object>;
    /**
     * @private
     * @returns {number} Actual payload id
     */
    private createPayloadId;
    get isSocketConnected(): boolean;
    checkSocketIsConneted(): void;
}
import BinanceWebsocketBase = require("./websocketBase");
