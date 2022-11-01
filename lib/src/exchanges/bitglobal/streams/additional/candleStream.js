const RuntimeError = require('../../../../base/errors/runtime.error');
const utils = require('../../../../base/utils/utils');
const MarketDataStream = require('../marketDataStream');

/**
 * Creates candlestick stream for FTX, witch based only on trades.
 *
 * **NOTE:** Only one stream should be registered on instance
 *
 * **DEV:** This class exists only for exchanges which does not supports kline streams natively
 */
class BitglobalCandleStream {
    /**
     * User event of the stream, witch candles stream based on
     *
     * @type {import('../marketDataStream').WebsocketEvent | null}
     */
    event = null;

    previousCandle = null;
    currentCandle = {};

    /**
     * @type {number} Interval id
     */
    interval = null;

    /**
     * @typedef {object} TradeDto
     * @property {string} p price
     * @property {string} v quantity
     * @property {string} t timestamp
     * @property {string} symbol
     * @property {'sell'|'buy'} s trade type
     */

    /**
     * Trades of opened candlestick
     *
     * @type {TradeDto[]}
     */
    trades = [];

    /**
     * Trades for last candlestick
     */
    previousTrades = [];

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

        this.intervalInMs =
            utils.timeIntervalToSeconds(this.event.interval) * 1000;

        this.previousCandle = await this.fetchLastCandle();

        const candleOpenTime =
            this.previousCandle.timestamp + this.intervalInMs;

        this.currentCandle.closeAt = candleOpenTime + this.intervalInMs;
        this.currentCandle.timestamp = candleOpenTime;

        this.trades = await this.fetchCurrentTrades(candleOpenTime);

        this.parentStream.sendSocketMessage({
            cmd: 'subscribe',
            args: ['TRADE:' + event.symbol.replace('/', '-')],
        });
    }

    /**
     * Unregister stream on websocket
     *
     * @public
     */
    async unregister() {
        if (!this.registered) {
            throw new RuntimeError("Candlestream doesn't registered");
        }

        this.parentStream.sendSocketMessage({
            cmd: 'unSubscribe',
            args: ['TRADE:' + this.event.symbol.replace('/', '-')],
        });

        this.event = null;
        this.previousClosedCandle = null;
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
            (trade) => new Date(trade.t).getTime() > fromTime,
        );
    }

    /**
     * @returns {Promise<TradeDto[]>}
     */
    async fetchTradesHistory() {
        return await this.parentStream.base
            .publicFetch(`spot/trades`, {
                searchParams: {
                    symbol: this.event.symbol.replace('/', '-'),
                },
            })
            .then((res) => {
                return res.data;
            })
            .catch((e) => {
                e;
            });
    }

    async fetchLastCandle() {
        const endTime = Date.now();
        const startTime = endTime - this.intervalInMs;

        return await this.parentStream.base
            .fetchCandleHistory({
                symbol: this.event.symbol,
                interval: this.event.interval,
                startTime,
                endTime,
            })
            .catch((e) => {
                throw e;
            })
            .then((candles) => {
                return candles.pop();
            });
    }

    serverPayloadHandler(payload) {
        if (!payload.data) return;

        const isRelevantTrade =
            payload.topic === 'TRADE' &&
            payload.data.symbol === this.event.symbol.replace('/', '-');

        require('inspector').console.log(payload);

        if (isRelevantTrade) {
            this.handleNewTrade(payload.data);
        }
    }

    /**
     * @param {TradeDto} trade
     */
    handleNewTrade(trade) {
        const timestamp = parseFloat(trade.t) * 1000;

        const isCurrentCandle = timestamp < this.currentCandle.closeAt;

        if (isCurrentCandle) {
            this.trades.push(trade);
            this.emitNewCandleStatus({ isClosed: false });
        }

        if (!isCurrentCandle) {
            if (this.previousTrades.length === 0) {
                this.previousTrades.push(trade);
            }
            this.emitNewCandleStatus({ isClosed: true });
            this.onCloseCandle();
            this.trades.push(trade);
            this.emitNewCandleStatus({ isClosed: false });
        }
    }

    onCloseCandle() {
        this.previousTrades = this.trades;
        this.trades = [];
        this.previousCandle = this.currentCandle;
        this.currentCandle = {};
        this.currentCandle.timestamp = this.previousCandle.closeAt;
        this.currentCandle.closeAt =
            this.currentCandle.timestamp + this.intervalInMs;
    }

    emitNewCandleStatus(additional) {
        if (this.trades.length === 0) {
            // Using last trade
            this.trades = this.previousTrades[this.previousTrades.length - 1];
        }

        const open = parseFloat(this.trades[0].p);

        const high = this.trades.reduce((acc, { p }) => {
            const price = parseFloat(p);
            if (price > acc) {
                return price;
            } else {
                return acc;
            }
        }, open);

        const low = this.trades.reduce((acc, { p }) => {
            const price = parseFloat(p);
            if (price < acc) {
                return price;
            } else {
                return acc;
            }
        }, open);

        const lastTrade = this.trades[this.trades.length - 1];
        const close = parseFloat(lastTrade.p);

        const volume = this.trades.reduce((acc, { v, p }) => {
            const price = parseFloat(p);
            const size = parseFloat(v);
            return price * size + acc;
        }, 0);

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

module.exports = BitglobalCandleStream;
