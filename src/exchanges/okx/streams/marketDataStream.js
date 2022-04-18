const debug = require('../../../base/etc/debug');
const utils = require('../utils');

const FtxWebsocketBase = require('./websocketBase');
const metadata = require('../metadata');

/**
 * @typedef {object} WebsocketEvent
 * @property {string} channel
 * @property {string} symbol
 * @property {string} [interval] Required if channel is kline
 * @param {WebsocketEvent} event
 */

class MarketDataStream extends FtxWebsocketBase {
    /**
     * @param {import('../wallets/spot')} baseInstance
     */
    constructor(baseInstance) {
        super(baseInstance);
    }

    /**
     * @type {Map<WebsocketEvent, CandleStream>}
     */
    candleStreams = new Map();

    /**
     * @returns {this}
     */
    async open() {
        if (this.isSocketConneted) return this;

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
        return await this.editSubscribition(event, 'subscribe');
    }

    /**
     * @param {WebsocketEvent} event
     */
    async unsubscribeFrom(event) {
        return await this.editSubscribition(event, 'unsubscribe');
    }

    /**
     * @private
     * @param {WebsocketEvent} arg
     * @param {'subscribe'|'unsubscribe'} command
     */
    async editSubscribition(arg, command) {
        const isJustSymbol = typeof arg === 'string';

        /**
         * @type {WebsocketEvent}
         */
        let event = {};

        if (isJustSymbol) {
            throw 'Not implemented'; // TODO: Full symbol subscribition
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
        //TODO: candleStream
        if (event.channel === 'candle') {
            this.sendSocketMessage({
                op: command,
                args: [
                    {
                        channel: metadata.timeIntervals[event.interval],
                        instId: event.symbol.replace('/', '-'),
                    },
                ],
            });

            return;
        }

        throw new Error('Uknown channel name ' + event.channel);
    }

    // TODO: Sav8sde all subscribition
    async unsubscribeFromAllbySymbol() {
        throw 'Not implemented';
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        if (msgEvent.toString() !== 'pong') {
            const payload = JSON.parse(msgEvent);

            this.emit('payload', payload);

            if (payload.arg && !payload.event) {
                if (payload.arg.channel === 'tickers') {
                    if (payload.data) {
                        this.emitNewPrice(payload);
                    }
                } else if (payload.arg.channel.includes('candle')) {
                    this.emitNewCandle(payload);
                }
            }
        }
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const priceObject = {
            symbol: payload.data[0].instId.replace('-', '/'),
            price: parseFloat(payload.data[0].last),
            timestamp: payload.data[0].ts,
        };

        utils.linkOriginalPayload(priceObject, payload);

        debug.log('Emit "newPrice" Event');
        debug.log(priceObject);

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
        const candleObject = {
            open: parseFloat(payload.data[0][1]),
            high: parseFloat(payload.data[0][2]),
            low: parseFloat(payload.data[0][3]),
            close: parseFloat(payload.data[0][4]),
            timestamp: parseFloat(payload.data[0][0]),
            interval: Object.keys(metadata.timeIntervals).find(
                (key) => metadata.timeIntervals[key] === payload.arg.channel,
            ),
            symbol: payload.arg.instId.replace('-', '/'),
            volume: parseFloat(payload.data[0][5]),
        };

        utils.linkOriginalPayload(candleObject, payload);

        debug.log('Emit "newCandle" Event');
        debug.log(candleObject);

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
        this.emit('candle', candleObject);
    }

    /**
     * @private
     * @param  {string[]} eventNames
     * @returns {Promise<object>} Server responce
     */
    async sendSocketUnsubscribe(...eventNames) {
        if (eventNames.lenght === 0) return; // nothing to do

        this.checkSocketIsConneted();

        const id = this.createPayloadId();

        const payload = {
            method: 'UNSUBSCRIBE',
            params: [...eventNames],
            id,
        };

        return await this.sendSocketMessage(payload);
    }

    checkSocketIsConnected() {
        if (!this.isSocketConnected) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }
}

module.exports = MarketDataStream;
