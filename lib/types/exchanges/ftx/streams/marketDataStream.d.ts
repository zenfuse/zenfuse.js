export = MarketDataStream;
/**
 * @typedef {object} WebsocketEvent
 * @property {string} channel
 * @property {string} symbol
 * @property {string} [interval] Required if channel is kline
 * @param {WebsocketEvent} event
 */
declare class MarketDataStream extends FtxWebsocketBase {
    /**
     * @type {Map<WebsocketEvent, CandleStream>}
     */
    candleStreams: Map<WebsocketEvent, CandleStream>;
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
    private editSubscription;
    /**
     * @private
     * @param {WebsocketEvent} event Candle stream event subscription
     */
    private setupCandleStream;
    /**
     * @param {WebsocketEvent} event Candle stream event subscription
     */
    unsetupCandleStream(event: WebsocketEvent): Promise<void>;
    unsubscribeFromAllBySymbol(): Promise<void>;
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
    /**
     * @private
     * @param  {string[]} eventNames
     * @returns {Promise<object>} Server response
     */
    private sendSocketUnsubscribe;
}
declare namespace MarketDataStream {
    export { WebsocketEvent };
}
import FtxWebsocketBase = require("./websocketBase");
type WebsocketEvent = {
    channel: string;
    symbol: string;
    /**
     * Required if channel is kline
     */
    interval?: string;
};
import CandleStream = require("./additional/candleStream");
