export = MarketDataStream;
declare class MarketDataStream extends FtxWebsocketBase {
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
     *
     * @typedef {object} WebsocketEvent
     * @property {string} channel
     * @property {string} symbol
     * @property {string} [interval] Required if channel is kline
     * @property {string} channel
     *
     * @param {string|WebsocketEvent} arg
     * @param {'subscribe'|'unsubscribe'} command
     */
    private editSubscribition;
    unsubscribeFromAllbySymbol(): Promise<void>;
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
    emitNewPrice(payload: any): void;
    /**
     * @private
     * @param  {string[]} eventNames
     * @returns {Promise<object>} Server responce
     */
    private sendSocketUnsubscribe;
}
import FtxWebsocketBase = require("./websocketBase");
