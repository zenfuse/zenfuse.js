const debug = require('../../../base/etc/debug');
const utils = require('../utils');

const FtxWebsocketBase = require('./websocketBase');
const CandleStream = require('./additional/candleStream');

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

        await super.open('public');

        this.socket.addEventListener(
            'message',
            this.serverMessageHandler.bind(this),
        );

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
            return this.sendSocketMessage({
                op: command,
                args: [
                    {
                        channel: 'tickers',
                        instId: event.symbol.replace('/', '-'),
                    },
                ]
            });
        }

        if (event.channel === 'candle') {
            if (command === 'subscribe') {
                await this.setupCandleStream(event);
            }
            if (command === 'unsubscribe') {
                await this.unsetupCandleStream(event);
            }
            return;
        }

        throw new Error('Uknown channel name ' + event.channel);
    }

    /**
     * @param {WebsocketEvent} event Candle stream event subscribtion
     */
    async setupCandleStream(event) {
        if (this.candleStreams.has(event)) {
            return; // Alredy registered
        }

        const candleStream = new CandleStream(this);

        await candleStream.register(event);

        this.candleStreams.set(event, candleStream);
    }

    /**
     * @param {WebsocketEvent} event Candle stream event subscribtion
     */
    async unsetupCandleStream(event) {
        const candleStream = this.candleStreams.get(event);

        if (!candleStream) {
            return; // Nothing to unregister
        }

        await candleStream.unregister();

        this.candleStreams.delete(event);
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
        const payload = JSON.parse(msgEvent.data);
        this.emit('payload', payload);

        if (payload.type === 'update') {
            if (payload.channel === 'ticker') {
                this.emitNewPrice(payload);
            }
        }
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const priceObject = {
            symbol: payload.market,
            price: payload.data.last,
            timestamp: payload.data.time,
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

    checkSocketIsConneted() {
        if (!this.isSocketConneted) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }
}

module.exports = MarketDataStream;
