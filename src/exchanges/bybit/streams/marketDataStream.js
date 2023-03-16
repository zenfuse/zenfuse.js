const debug = require('../../../base/etc/debug');
const RuntimeError = require('../../../base/errors/runtime.error');

const BybitWebsocketBase = require('./websocketBase');

class MarketDataStream extends BybitWebsocketBase {
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
        super();
        this.base = baseInstance;

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
     *
     * @returns {this}
     */
    close() {
        if (this.isSocketConnected) {
            this.socket.close();
        }

        return this;
    }

    async subscribeTo(event) {
        return await this.editSubscription(event, 'subscribe');
    }

    /**
     * @param {string|WebsocketEvent} event
     */
    async unsubscribeFrom(event) {
        return await this.editSubscription(event, 'unsubscribe');
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
    async editSubscription(event, command) {
        if (!['subscribe', 'unsubscribe'].includes(command)) {
            throw new TypeError('Unknown command ' + command);
        }

        if (event.channel === 'price') {
            const symbol = event.symbol.replace('/', '').toLowerCase();

            if (command === 'subscribe') {
                await this.sendSocketSubscribe(`${symbol}@kline_1m`);
                return;
            }

            if (command === 'unsubscribe') {
                await this.sendSocketUnsubscribe(`${symbol}@kline_1m`);
                return;
            }
        }

        if (event.channel === 'candle') {
            const symbol = event.symbol.replace('/', '').toLowerCase();

            if (command === 'subscribe') {
                await this.sendSocketSubscribe(
                    `${symbol}@kline_${event.interval}`,
                );
                return;
            }

            if (command === 'unsubscribe') {
                await this.sendSocketUnsubscribe(
                    `${symbol}@kline_${event.interval}`,
                );
                return;
            }
        }

        throw new TypeError(`Unknown channel name ${event.channel}`);
    }

    async unsubscribeFromAllBySymbol(symbol) {
        const symbolToDelete = symbol.replace('/', '').toLowerCase();

        const requestPayload = {
            method: 'LIST_SUBSCRIPTIONS',
            id: this.createPayloadId(),
        };

        const allSubs = await this.sendSocketMessage(requestPayload);

        const subsToDelete = allSubs.filter((a) => a.includes(symbolToDelete));

        await this.sendSocketUnsubscribe(...subsToDelete);
    }

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        let payload;

        try {
            payload = JSON.parse(msgEvent.data);
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
                    'Bybit MarketDataStream message queue out of sync',
                );
            }

            const [resolve, reject] = this.messageQueue.get(payload.id);

            const isErrorMsg = !!payload.code; // code value has only error payload on binance

            if (isErrorMsg) {
                reject(payload.msg);
                return;
            }

            resolve(payload.result);
            return;
        }

        if (payload.e === 'kline') {
            this.emitNewPrice(payload);
            this.emitCandle(payload);
        }
    }

    /**
     * @fires MarketDataStream#newPrice
     * @param {*} payload
     */
    emitNewPrice(payload) {
        const kline = this.transformCandlestick(payload.k);
        const parsedSymbol = this.base.parseBybitSymbol(kline.symbol);

        debug.log('Emit "price" Event');
        debug.log(kline);

        // TODO: Return type
        this.emit('newPrice', {
            symbol: parsedSymbol,
            price: parseFloat(kline.close),
            timestamp: kline.timestamp,
        });
    }

    /**
     * @fires MarketDataStream#kline
     * @param {*} payload
     */
    emitCandle(payload) {
        const kline = this.transformCandlestick(payload.k);

        kline.symbol = this.base.parseBybitSymbol(kline.symbol);

        debug.log('Emit "candle" Event');
        debug.log(kline);

        this.emit('candle', kline);
    }

    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server response
     */
    async sendSocketSubscribe(...eventNames) {
        this.checkSocketIsConnected();

        const payload = {
            method: 'SUBSCRIBE',
            params: [...eventNames],
            id: this.createPayloadId(),
        };

        return await this.sendSocketMessage(payload);
    }

    /**
     * @private
     * @param  {string[]} eventNames
     * @returns {Promise<object>} Server response
     */
    async sendSocketUnsubscribe(...eventNames) {
        if (eventNames.length === 0) return; // nothing to do

        this.checkSocketIsConnected();

        const id = this.createPayloadId();

        const payload = {
            method: 'UNSUBSCRIBE',
            params: [...eventNames],
            id,
        };

        return await this.sendSocketMessage(payload);
    }

    /**
     * @param {object} msg
     * @returns {Promise<object>}
     */
    sendSocketMessage(msg) {
        this.checkSocketIsConnected();

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

    get isSocketConnected() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
    }

    checkSocketIsConnected() {
        if (!this.isSocketConnected) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }
}

module.exports = MarketDataStream;
