const debug = require('../../../base/etc/debug');
const utils = require('../utils');

const BithumbWebsocketBase = require('./websocketBase');

class MarketDataStream extends BithumbWebsocketBase {
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
        if (this.isSocketConnected) return this;

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
     * @typedef {object} WebsocketEvent
     * @property {string} channel
     * @property {string} symbol
     * @property {string} [interval] Required if channel is kline
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
        } else {
            event = arg;
        }

        if (event.channel === 'price') {
            return this.sendSocketMessage({
                cmd: command,
                args: ['TICKER:' + event.symbol.replace('/', '-')],
            });
        }

        throw new Error('Uknown channel name ' + event.channel);
    }

    // TODO: Save all subscribition
    async unsubscribeFromAllbySymbol() {
        throw 'Not implemented';
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        const payload = JSON.parse(msgEvent.data);

        if (payload.code === '00007' && payload.topic === 'TICKER') {
            this.emitNewPrice(payload);
        }

        this.emit('payload', payload);
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const priceObject = {
            symbol: payload.data.symbol.replace('-', '/'),
            price: parseFloat(payload.data.c),
            timestamp: payload.timestamp,
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
     * @returns {Promise<object>} Server response
     */
    async sendSocketUnsubscribe(...eventNames) {
        if (eventNames.lenght === 0) return; // nothing to do

        this.checkSocketIsConnected();

        const id = this.createPayloadId();

        const payload = {
            cmd: 'UNSUBSCRIBE',
            args: [...eventNames],
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
