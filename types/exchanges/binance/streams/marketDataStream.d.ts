export = MarketDataStream;
declare class MarketDataStream extends BinanceWebsocketBase {
    lastPayloadId: number;
    /**
     * @type {import('ws').WebSocket}
     */
    socket: any;
    /**
     * Messages that are waiting for a response with a specific id
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
    /**
     *
     * @param {object} param
     * @param {string} channel
     * @param {string} symbol
     * @param {string} [interval] Required if channel is kline
     * @param {string} channel
     */
    watchOn(param: object): Promise<void>;
    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    private serverMessageHandler;
    /**
     * @fires MarketDataStream#kline
     *
     * @param {*} payload
     */
    emitNewCandlestick(payload: any): void;
    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server responce
     */
    private subscribeOnEvent;
    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server responce
     */
    private unsubscribeOnEvent;
    /**
     * @param {object} msg
     * @returns {Promise<object>}
     */
    sendSocketMessage(msg: object): Promise<object>;
    /**
     * @private
     * @returns {number} Actual payload id
     */
    private getActualPayloadId;
    get isSocketConneted(): boolean;
    checkSocketIsConneted(): void;
}
import BinanceWebsocketBase = require("./websocketBase");
