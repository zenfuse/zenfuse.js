const debug = require('../../../base/etc/debug');
const utils = require('../../../base/utils/utils');
const RuntimeError = require('../../../base/errors/runtime.error');

const HuobiWebsocketBase = require('./websocketBase');
const { timeIntervals, intervalsMap } = require('../metadata');

class MarketDataStream extends HuobiWebsocketBase {
    lastPayloadId = 0;

    /**
     * @type {import('ws').WebSocket}
     */
    socket;

    /**
     * Messages that are waiting for a response with a specific id
     *
     * @type {Map<string, [typeof Promise.resolve, typeof Promise.reject]>}
     */
    messageQueue = new Map();

    /**
     *
     */
    state = {
        watch: new Set(),
    };

    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super(baseInstance);

        this.setMaxListeners(Infinity);
    }

    /**
     * @returns {this}
     */
    async open() {
        this.socket = await this.getSocketConnection('ws');

        this.socket.addEventListener(
            'message',
            this.serverMessageHandler.bind(this),
        );

        return this;
    }

    /**
     * @returns {this}
     */
    close() {
        if (this.isSocketConneted) {
            this.socket.close();
        }

        return this;
    }

    /**
     * @param {string|WebsocketEvent} event
     */
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
     * @property {string} [interval] Required if channel is candle
     * @param {WebsocketEvent} event
     * @param {'subscribe'|'unsubscribe'} command
     */
    async editSubscribition(event, command) {
        if (!['subscribe', 'unsubscribe'].includes(command)) {
            throw new TypeError('Uknown command ' + command);
        }

        const symbol = event.symbol.replace('/', '').toLowerCase();

        if (event.channel === 'price') {
            const eventName = `market.${symbol}.ticker`;
            if (command === 'subscribe') {
                await this.sendSocketSubscribe(eventName);
                return;
            }

            if (command === 'unsubscribe') {
                await this.sendSocketUnsubscribe(eventName);
                return;
            }
        }

        if (event.channel === 'candle') {
            const eventName = `market.${symbol}.kline.${
                timeIntervals[event.interval]
            }`;
            if (command === 'subscribe') {
                await this.sendSocketSubscribe(eventName);
                return;
            }

            if (command === 'unsubscribe') {
                await this.sendSocketUnsubscribe(eventName);
                return;
            }
        }

        throw new TypeError(`Uknown channel name ${event.channel}`);
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    async serverMessageHandler(msgEvent) {
        let payload;

        try {
            const dezipped = await this.unzip(msgEvent.data);
            payload = JSON.parse(dezipped);
        } catch (error) {
            this.emit('error', error);
            debug.error(error);
            return;
        }

        this.emit('payload', payload);

        if (payload.id) {
            // this message is response for specific request
            if (!this.messageQueue.has(payload.id)) {
                throw new RuntimeError(
                    'Huobi MarketDataStream mesage queue unsynced',
                );
            }

            const [resolve, reject] = this.messageQueue.get(payload.id);

            const isErrorMsg = payload.status !== 'ok'; // code value has only error payload on binance

            if (isErrorMsg) {
                reject(payload);
                return;
            }

            resolve(payload);
            return;
        }

        if (payload.ping) {
            this.sentPong(payload.ping);
        }

        if (!payload.ch) return;

        if (payload.ch.endsWith('ticker')) {
            this.emitNewPrice(payload);
        }

        if (payload.ch.split('.')[2] === 'kline') {
            this.emitCandle(payload);
        }
    }

    /**
     * @fires MarketDataStream#newPrice
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const parsedSymbol = this.base.parseHuobiSymbol(
            payload.ch.split('.')[1],
        );

        const priceObject = {
            symbol: parsedSymbol,
            price: payload.tick.lastPrice,
            timestamp: payload.ts,
        };

        debug.log('Emit "price" Event');
        debug.log(priceObject);

        utils.linkOriginalPayload(priceObject, payload);
        this.emit('newPrice', priceObject);
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitCandle(payload) {
        const kline = {
            open: payload.tick.open,
            high: payload.tick.open,
            low: payload.tick.open,
            close: payload.tick.open,
            volume: payload.tick.vol,
            interval: intervalsMap.get(payload.ch.split('.')[3]),
            timestamp: payload.ts,
        };

        kline.symbol = this.base.parseHuobiSymbol(payload.ch.split('.')[1]);

        debug.log('Emit "candle" Event');
        debug.log(kline);

        utils.linkOriginalPayload(kline, payload);

        this.emit('candle', kline);
    }

    /**
     * @private
     * @param  {string} eventName
     * @returns {Promise<object>} Server responce
     */
    async sendSocketSubscribe(eventName) {
        this.checkSocketIsConneted();

        const payload = {
            sub: eventName,
            id: this.createPayloadId(),
        };

        return await this.sendSocketMessage(payload);
    }

    /**
     * @private
     * @param  {string[]} eventName
     * @returns {Promise<object>} Server responce
     */
    async sendSocketUnsubscribe(eventName) {
        this.checkSocketIsConneted();

        const payload = {
            unsub: eventName,
            id: this.createPayloadId(),
        };

        return await this.sendSocketMessage(payload);
    }

    /**
     * @param {object} msg
     * @returns {Promise<object>}
     */
    sendSocketMessage(msg) {
        this.checkSocketIsConneted();

        const msgString = JSON.stringify(msg);

        this.socket.send(msgString);

        debug.log('-> OUT');
        debug.log(msg);

        return new Promise((resolve, reject) => {
            this.messageQueue.set(msg.id, [resolve, reject]);
        });
    }

    /**
     * @private
     * @returns {number} Actual payload id
     */
    createPayloadId() {
        this.lastPayloadId = ++this.lastPayloadId;
        return this.lastPayloadId;
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
    }

    /**
     * @private
     * @param {number} integer From ping message
     */
    sentPong(integer) {
        this.socket.send(`{"pong": ${integer}}`);
    }
}

module.exports = MarketDataStream;
