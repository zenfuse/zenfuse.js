export = MarketDataStream;
/**
 * @typedef {object} WebsocketEvent
 * @property {string} channel
 * @property {string} symbol
 * @property {string} [interval] Required if channel is kline
 * @param {WebsocketEvent} event
 */
declare class MarketDataStream extends OkxWebsocketBase {
    /**
     * @returns {this}
     */
    open(): this;
    /**
     * @param {WebsocketEvent} event
     */
    subscribeTo(event: WebsocketEvent): Promise<void>;
    /**
     * @param {WebsocketEvent} event
     */
    unsubscribeFrom(event: WebsocketEvent): Promise<void>;
    /**
     * @private
     * @param {WebsocketEvent} arg
     * @param {'subscribe'|'unsubscribe'} command
     */
    private editSubscribition;
    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    private serverMessageHandler;
    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitNewPrice(payload: any): void;
    emitNewCandle(payload: any): void;
}
declare namespace MarketDataStream {
    export { WebsocketEvent };
}
import OkxWebsocketBase = require("./websocketBase");
type WebsocketEvent = {
    channel: string;
    symbol: string;
    /**
     * Required if channel is kline
     */
    interval?: string;
};
