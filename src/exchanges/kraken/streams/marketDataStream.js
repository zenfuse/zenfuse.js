const utils = require('../../../base/utils/utils');

const OkxWebsocketBase = require('./websocketBase');
const { timeIntervals } = require('../metadata');

/**
 * @typedef {object} WebsocketEvent
 * @property {string} channel
 * @property {string} symbol
 * @property {string} [interval] Required if channel is kline
 * @param {WebsocketEvent} event
 */

class MarketDataStream extends OkxWebsocketBase {
    /**
     * @returns {this}
     */
    async open() {
        if (this.isSocketConnected) return this;

        await super.open('ws/v5/public');

        // this.socket.addEventListener(
        //     'message',
        //     this.serverMessageHandler.bind(this),
        // );
        this.socket.on('message', this.serverMessageHandler.bind(this));

        return this;
    }

    /**
     * @param {WebsocketEvent} event
     */
    async subscribeTo(event) {
        return await this.editSubscription(event, 'subscribe');
    }

    /**
     * @param {WebsocketEvent} event
     */
    async unsubscribeFrom(event) {
        return await this.editSubscription(event, 'unsubscribe');
    }

    /**
     * @private
     * @param {WebsocketEvent} arg
     * @param {'subscribe'|'unsubscribe'} command
     */
    async editSubscription(arg, command) {
        const isJustSymbol = typeof arg === 'string';

        /**
         * @type {WebsocketEvent}
         */
        let event = {};

        if (isJustSymbol) {
            throw 'Not implemented'; // TODO: Full symbol subscription
        } else {
            event = arg;
        }

        if (event.channel === 'price') {
            this.sendSocketMessage({
                op: command,
                args: [
                    {
                        channel: 'tickers',
                        instId: event.symbol.replace('/', '-'),
                    },
                ],
            });
            return;
        }

        if (event.channel === 'candle') {
            this.sendSocketMessage({
                op: command,
                args: [
                    {
                        channel: timeIntervals[event.interval],
                        instId: event.symbol.replace('/', '-'),
                    },
                ],
            });
            return;
        }

        throw new Error('Unknown channel name ' + event.channel);
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        if (msgEvent.toString() === 'pong') return;

        const payload = JSON.parse(msgEvent);

        this.emit('payload', payload);

        if (payload.arg && !payload.event) {
            if (payload.arg.channel === 'tickers') {
                if (payload.data) {
                    this.emitNewPrice(payload);
                }
            }
            if (payload.arg.channel.includes('candle')) {
                this.emitNewCandle(payload);
            }
        }
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const ticker = payload.data[0];

        const priceObject = {
            symbol: ticker.instId.replace('-', '/'),
            price: parseFloat(ticker.last),
            timestamp: parseFloat(ticker.ts),
        };

        utils.linkOriginalPayload(priceObject, payload);

        /**
         * Event represent new
         *
         * @event MarketDataStream#newPrice
         * @type {{
         *      symbol: string,
         *      price: number,
         *      timestamp: number
         * }}
         */
        this.emit('newPrice', priceObject);
    }

    emitNewCandle(payload) {
        const [timestamp, open, high, low, close, volume] = payload.data[0];

        const candle = {
            open: parseFloat(open),
            high: parseFloat(high),
            low: parseFloat(low),
            close: parseFloat(close),
            timestamp: parseFloat(timestamp),
            interval: Object.keys(timeIntervals).find(
                (key) => timeIntervals[key] === payload.arg.channel,
            ),
            symbol: payload.arg.instId.replace('-', '/'),
            volume: parseFloat(volume),
        };

        utils.linkOriginalPayload(candle, payload);

        /**
         * Event represent new
         *
         * @event MarketDataStream#newCandle
         * @type {{
         *      open: number,
         *      high: number,
         *      low: number,
         *      close: number,
         *      timestamp: number,
         *      interval: string,
         *      symbol: string,
         *      volume: number
         * }}
         */
        this.emit('candle', candle);
    }

    checkSocketIsConnected() {
        if (!this.isSocketConnected) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }
}

module.exports = MarketDataStream;
