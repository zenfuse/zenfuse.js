const RuntimeError = require('../../../../base/errors/runtime.error');
const utils = require('../../utils');
const MarketDataStream = require('../marketDataStream');

/**
 * Creates candlestick stream for FTX, wich based only on trades.
 *
 * **NOTE:** Only one stream should be registered on instance
 *
 * **DEV:** This class exists only for exchanges which does not supports kline streams natively
 */
class FtxCandleStream {
    /**
     * User event of the stream, witch candles stream based on
     *
     * @type {import('../marketDataStream').WebsocketEvent | null}
     */
    event = null;

    previusCandle = null;
    currentCandle = {};

    /**
     * @type {number} Interval id
     */
    interval = null;

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
    trades = [];

    /**
     * @returns {boolean}
     */
    get registered() {
        return this.event !== null;
    }

    /**
     * @param {MarketDataStream} parentStream
     */
    constructor(parentStream) {
        this.parentStream = parentStream;

        this.parentStream.on('payload', this.serverPayloadHandler.bind(this));

        this.parentStream.on('candle', (candle) => {
            require('inspector').console.log('Candle event');
            require('inspector').console.log(candle);
        });
    }

    /**
     * Registers new stream on websocket
     *
     * @public
     * @param {import('../marketDataStream.js').WebsocketEvent} event
     */
    async register(event) {
        if (this.registered) {
            throw new RuntimeError('Candlestream already registered');
        }

        this.event = event;

        this.previusCandle = await this.fetchLastCandle();

        this.intervalInMs =
            utils.timeIntervalToSeconds(this.event.interval) * 1000;

        const candleOpenTime = this.previusCandle.timestamp + this.intervalInMs;

        this.currentCandle.closeTime = candleOpenTime + this.intervalInMs;
        this.currentCandle.timestamp = candleOpenTime;

        this.trades = await this.fetchCurrentTrades(candleOpenTime);

        this.parentStream.sendSocketMessage({
            op: 'subscribe',
            channel: 'trades',
            market: event.symbol,
        });
    }

    /**
     * Unregisters stream on websocket
     *
     * @public
     */
    async unregister() {
        if (!this.registered) {
            throw new RuntimeError("Candlestream doesn't registered");
        }

        this.parentStream.sendSocketMessage({
            op: 'unsubscribe',
            channel: 'trades',
            market: this.event.symbol,
        });

        this.event = null;
        this.previusClosedCandle = null;
    }

    /**
     * @param {number} fromTime UNIX Time
     * @returns {Promise<TradeDto[]>}
     */
    async fetchCurrentTrades(fromTime) {
        const history = await this.fetchTradesHistory().catch((e) => {
            e;
        });

        return history.filter(
            (trade) => new Date(trade.time).getTime() > fromTime,
        );
    }

    /**
     * @returns {Promise<TradeDto[]>}
     */
    async fetchTradesHistory() {
        return await this.parentStream.base
            .publicFetch(`api/markets/${this.event.symbol}/trades`)
            .then((res) => res.result);
    }

    async fetchLastCandle() {
        return await this.parentStream.base
            .fetchCandleHistory({
                symbol: this.event.symbol,
                interval: this.event.interval,
                // TODO: Find way to fetch 1 candle using startTime
                // WARN: Pain here
                // startTime: baseTime - 60000 * 15,
                // endTime: baseTime - 60000aqweotruciqpwtcqwtc
            })
            .catch((e) => {
                throw e;
            })
            // IDEA: Using chonky response for historical chart data
            .then((candles) => {
                return candles.pop();
            });
    }

    serverPayloadHandler(payload) {
        const isRelevantTrade =
            payload.channel === 'trades' &&
            payload.type === 'update' &&
            payload.market === this.event.symbol;

        if (isRelevantTrade) {
            this.handleNewTrades(payload.data);
        }
    }

    /**
     * @param {TradeDto[]} trades
     */
    handleNewTrades(trades) {
        const nextTrades = trades.filter(
            (trade) =>
                new Date(trade.time).getDate() > this.currentCandle.closeTime,
        );

        const actualTrades = trades.filter(
            (trade) =>
                new Date(trade.time).getDate() < this.currentCandle.closeTime,
        );

        this.trades.push(...actualTrades);

        if (nextTrades.length === 0) {
            this.emitNewCandleStatus();
        }

        if (nextTrades.length > 0) {
            this.emitNewCandleStatus({ isClosed: true });
            this.trades = nextTrades;
            this.onCloseCandle();
            this.emitNewCandleStatus();
        }
    }

    onCloseCandle() {
        this.previusCandle = this.currentCandle;
        this.currentCandle = {};
        this.currentCandle.timestamp = this.previusCandle.closeTime;
        this.currentCandle.closeAt =
            this.currentCandle.timestamp + this.intervalInMs;
    }

    emitNewCandleStatus(additional) {
        const open = this.trades[0].price;

        const high = this.trades.reduce((acc, { price }) => {
            if (price > acc) {
                return price;
            } else {
                return acc;
            }
        }, open);

        const low = this.trades.reduce((acc, { price }) => {
            if (price < acc) {
                return price;
            } else {
                return acc;
            }
        }, open);

        const lastTrade = this.trades[this.trades.length - 1];
        const close = lastTrade.price;

        const volume = this.trades.reduce(
            (acc, { size, price }) => price * size + acc,
            0,
        );

        const candle = {
            symbol: this.event.symbol,
            open,
            high,
            low,
            close,
            volume,
            timestamp: this.currentCandle.timestamp,
            interval: this.event.interval,
            closeAt: this.currentCandle.closeAt,
            ...additional,
        };

        this.parentStream.emit('candle', candle);

        this.currentCandle = candle;
    }
}

module.exports = FtxCandleStream;
