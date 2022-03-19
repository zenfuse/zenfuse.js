export = FtxCandleStream;
/**
 * Creates candlestick stream for FTX, wich based only on trades.
 *
 * **NOTE:** Only one stream should be registered on instance
 *
 * **DEV:** This class exists only for exchanges which does not supports kline streams natively
 */
declare class FtxCandleStream {
    /**
     * @param {MarketDataStream} parentStream
     */
    constructor(parentStream: MarketDataStream);
    /**
     * User event of the stream, witch candles stream based on
     *
     * @type {import('../marketDataStream').WebsocketEvent | null}
     */
    event: import('../marketDataStream').WebsocketEvent | null;
    previusCandle: any;
    currentCandle: {};
    /**
     * @type {number} Interval id
     */
    interval: number;
    /**
     * @typedef {object} TradeDto
     * @property {string} p price
     * @property {string} v quantity
     * @property {string} price
     * @property {'sell'|'buy'} s trade type
     */
    /**
     * Trades of opened candlestick
     *
     * @type {TradeDto[]}
     */
    trades: {
        /**
         * price
         */
        p: string;
        /**
         * quantity
         */
        v: string;
        price: string;
        /**
         * trade type
         */
        s: 'sell' | 'buy';
    }[];
    /**
     * @returns {boolean}
     */
    get registered(): boolean;
    parentStream: MarketDataStream;
    /**
     * Registers new stream on websocket
     *
     * @public
     * @param {import('../marketDataStream.js').WebsocketEvent} event
     */
    public register(event: any): Promise<void>;
    intervalInMs: number;
    /**
     * Unregisters stream on websocket
     *
     * @public
     */
    public unregister(): Promise<void>;
    previusClosedCandle: any;
    /**
     * @param {number} fromTime UNIX Time
     * @returns {Promise<TradeDto[]>}
     */
    fetchCurrentTrades(fromTime: number): Promise<{
        /**
         * price
         */
        p: string;
        /**
         * quantity
         */
        v: string;
        price: string;
        /**
         * trade type
         */
        s: 'sell' | 'buy';
    }[]>;
    /**
     * @returns {Promise<TradeDto[]>}
     */
    fetchTradesHistory(): Promise<{
        /**
         * price
         */
        p: string;
        /**
         * quantity
         */
        v: string;
        price: string;
        /**
         * trade type
         */
        s: 'sell' | 'buy';
    }[]>;
    fetchLastCandle(): Promise<any>;
    serverPayloadHandler(payload: any): void;
    /**
     * @param {TradeDto[]} trades
     */
    handleNewTrades(trades: {
        /**
         * price
         */
        p: string;
        /**
         * quantity
         */
        v: string;
        price: string;
        /**
         * trade type
         */
        s: 'sell' | 'buy';
    }[]): void;
    onCloseCandle(): void;
    emitNewCandleStatus(additional: any): void;
}
import MarketDataStream = require("../marketDataStream");
