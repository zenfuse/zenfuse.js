const debug = require('../../../base/etc/debug');
const { timeIntervals } = require('../metadata');
const utils = require('../utils');

const BinanceWebsocketBase = require('./websocketBase');

class MarketDataStream extends BinanceWebsocketBase {
    lastPayloadId = 0;

    /**
     * @type {import('ws').WebSocket}
     */
    socket;

    /**
     * Messages that are waiting for a response with a specific id
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
        if (this.isSocketConneted) {
            this.socket.close();
        }

        return this;
    }

    /**
     *
     * @param {object} param
     * @param {string} channel
     * @param {string} symbol
     * @param {string} [interval] Required if channel is kline
     * @param {string} channel
     */
    async watchOn(param) {
        if (param.channel === 'kline') {
            const symbol = utils
                .transformMarketString(param.symbol)
                .toLowerCase();
            const interval = timeIntervals[param.interval];

            await this.subscribeOnEvent(`${symbol}@kline_${interval}`);

            return;
        }

        throw new Error('Uknown channel name ' + param.channel);
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

        if (payload.id) {
            // this message is responce for specific request
            if (!this.messageQueue.has(payload.id)) {
                throw new Error('Mesage queue unsynced');
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

        debug.log('<- IN');
        debug.log(payload);
        debug.log('');

        switch (payload.e) {
            case 'kline':
                this.emitNewCandlestick(payload);
                break;

            default:
                debug.error('Unsupported event on payload:');
                debug.error(payload);
        }
    }

    /**
     * @fires MarketDataStream#kline
     *
     * @param {*} payload
     */
    emitNewCandlestick(payload) {
        const kline = utils.transfornCandlestick(payload.k);

        kline[Symbol.for('zenfuse.originalPayload')] = payload;

        debug.log('Emit "kline" Event');
        debug.log(kline);

        /**
         * Event represent new
         *
         * @event MarketDataStream#kline
         * @type {import('../../..').Kline}
         */
        this.emit('kline', kline);
    }

    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server responce
     */
    async subscribeOnEvent(...eventNames) {
        this.checkSocketIsConneted();

        const id = this.getActualPayloadId();

        const payload = {
            method: 'SUBSCRIBE',
            params: [...eventNames],
            id,
        };

        return await this.sendSocketMessage(payload);
    }

    /**
     * @private
     * @param  {...string} eventNames
     * @returns {Promise<object>} Server responce
     */
    async unsubscribeOnEvent(...eventNames) {
        this.checkSocketIsConneted();

        const id = this.getActualPayloadId();

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
        // TODO: Rename this shit
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
    getActualPayloadId() {
        this.lastPayloadId = ++this.lastPayloadId;
        return this.lastPayloadId;
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
    }

    checkSocketIsConneted() {
        if (!this.isSocketConneted) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }
}

module.exports = MarketDataStream;
