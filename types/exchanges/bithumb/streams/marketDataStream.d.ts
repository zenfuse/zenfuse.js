export = MarketDataStream;
declare class MarketDataStream extends BithumbWebsocketBase {
    /**
     * @type {Map<WebsocketEvent, CandleStream>}
     */
    candleStreams: Map<{
        channel: string;
        symbol: string;
        /**
         * Required if channel is kline
         */
        interval?: string;
    }, CandleStream>;
    /**
     * @returns {this}
     */
    open(): this;
    subscribeTo(event: any): Promise<void>;
    /**
     * @param {string|WebsocketEvent} event
     */
    unsubscribeFrom(event: string | {
        channel: string;
        symbol: string;
        /**
         * Required if channel is kline
         */
        interval?: string;
    }): Promise<void>;
    /**
     * @private
     * @typedef {object} WebsocketEvent
     * @property {string} channel
     * @property {string} symbol
     * @property {string} [interval] Required if channel is kline
     * @param {string|WebsocketEvent} arg
     * @param {'subscribe'|'unsubscribe'} command
     */
    private editSubscribition;
    /**
     * @private
     * @param {WebsocketEvent} event Candle stream event subscribtion
     */
    private setupCandleStream;
    /**
     * @param {WebsocketEvent} event Candle stream event subscribtion
     */
    unsetupCandleStream(event: {
        channel: string;
        symbol: string;
        /**
         * Required if channel is kline
         */
        interval?: string;
    }): Promise<void>;
    unsubscribeFromAllbySymbol(): Promise<void>;
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
import BithumbWebsocketBase = require("./websocketBase");
import CandleStream = require("./additional/candleStream");
