const { util } = require('prettier');
const debug = require('../../../base/etc/debug');
const { timeIntervals } = require('../metadata');
const utils = require('../utils');

const FtxWebsocketBase = require('./websocketBase');

class MarketDataStream extends FtxWebsocketBase {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super(baseInstance);
    }

    /**
     * @returns {this}
     */
    async open() {
        if (this.isSocketConneted) return this;

        await super.open();

        this.socket.addEventListener(
            'message',
            this.serverMessageHandler.bind(this),
        );

        return this;
    }

    async subscribeTo(event) {
        return await this.editSubscribition(event, 'subscribe');
    }

    /**
     * @param {string|WebsocketEvent} event
     */
    async unsubscribeFrom(event) {
        return await this.editSubscribition(event, 'unsubscribe');
    }

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
    async editSubscribition(arg, command) {
        const isJustSymbol = typeof arg === 'string';

        /**
         * @type {WebsocketEvent}
         */
        let event = {};

        if (isJustSymbol) {
            throw 'Not implemented'; // TODO: Full symbol subscribition
            if (command === 'unsubscribe') {
                return await this.unsubscribeFromAllbySymbol(arg);
            }

            event.channel = 'trades';
            event.symbol = arg;
        } else {
            event = arg;
        }

        if (event.channel === 'price') {
            return this.sendSocketMessage({
                op: command,
                channel: 'ticker',
                market: event.symbol,
            });
        }

        throw new Error('Uknown channel name ' + event.channel);
    }

    // TODO: Save all subscribition
    async unsubscribeFromAllbySymbol(symbol) {
        throw 'Not implemented';
        await this.sendSocketUnsubscribe(...subsToDelete);
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        const payload = JSON.parse(msgEvent.data);

        if (payload.type === 'error') {
            require('inspector').console.error(msgEvent);
            debugger;
        }

        if (payload.type === 'update') {
            if (payload.channel === 'ticker') {
                this.emitNewPrice(payload);
            }
        }

        this.emit('payload', payload);
    }

    /**
     * @fires MarketDataStream#kline
     *
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
