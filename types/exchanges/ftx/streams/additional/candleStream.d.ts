export = FtxCandleStream;
/**
 * Creates candlestick stream for FTX, which based only on trades.
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
    previousCandle: any;
    currentCandle: {};
    /**
     * @type {number} Interval id
     */
    interval: number;
    /**
     * @typedef {object} TradeDto
     * @property {number} id
     * @property {boolean} liquidation
     * @property {number} price
     * @property {'sell'|'buy'} side
     * @property {number} size
     * @property {string} time
     */
    /**
     * Trades of opened candlestick
     *
     * @type {TradeDto[]}
     */
    trades: {
        id: number;
        liquidation: boolean;
        price: number;
        side: 'sell' | 'buy';
        size: number;
        time: string;
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
    public register(event: import('../marketDataStream.js').WebsocketEvent): Promise<void>;
    intervalInMs: number;
    /**
     * Unregister stream on websocket
     *
     * @public
     */
    public unregister(): Promise<void>;
    previousClosedCandle: any;
    /**
     * @param {number} fromTime UNIX Time
     * @returns {Promise<TradeDto[]>}
     */
    fetchCurrentTrades(fromTime: number): Promise<{
        id: number;
        liquidation: boolean;
        price: number;
        side: 'sell' | 'buy';
        size: number;
        time: string;
    }[]>;
    /**
     * @returns {Promise<TradeDto[]>}
     */
    fetchTradesHistory(): Promise<{
        id: number;
        liquidation: boolean;
        price: number;
        side: 'sell' | 'buy';
        size: number;
        time: string;
    }[]>;
    fetchLastCandle(): Promise<import("../../../../base/schemas/kline").ZenfuseKline>;
    serverPayloadHandler(payload: any): void;
    /**
     * @param {TradeDto[]} trades
     */
    handleNewTrades(trades: {
        id: number;
        liquidation: boolean;
        price: number;
        side: 'sell' | 'buy';
        size: number;
        time: string;
    }[]): void;
    onCloseCandle(): void;
    emitNewCandleStatus(additional: any): void;
}
import MarketDataStream = require("../marketDataStream");
