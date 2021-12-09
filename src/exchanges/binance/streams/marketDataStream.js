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

        this.on('newListener', this.handleNewListener.bind(this));
        this.on('removeListener', this.handleRemoveListener.bind(this));
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
     */
    watchOn(param) {
        if (param.channel === 'candle') {
            const eventName = `${param.symbol}@kline_${param.interval}`;

            this.subscribeOnEvent(eventName).catch((err) => {
                throw err;
            });

            return;
        }

        throw new Error('Uknown channel name ' + param.channel);
    }

    /**
     * @private
     * @param {string} eventName
     * @param {function} listener
     */
    handleRemoveListener(eventName, listener) {}

    /**
     * @private
     * @param {string} eventName
     * @param {function} listener
     */
    handleNewListener(eventName, listener) {}

    /**
     * @private
     * @param {import('ws').MessageEvent} msgEvent
     */
    serverMessageHandler(msgEvent) {
        let msg;

        try {
            msg = JSON.parse(msgEvent.data);
        } catch (error) {
            this.emit('error', error);
            require('inspector').console.error(error);
            return;
        }

        if (msg.id) {
            // this message is responce for specific request
            if (!this.messageQueue.has(msg.id)) {
                throw new Error('Mesage queue unsynced');
            }

            const [resolve, reject] = this.messageQueue.get(msg.id);

            // code value has only error payload on binance
            if (msg.code) {
                reject(msg.msg);
                return;
            }

            resolve(msg.result);
            return;
        }

        require('inspector').console.log('<- IN');
        require('inspector').console.log(msg);
        require('inspector').console.log('');

        switch (msg.e) {
            case 'kline':
                this.emit('OHLCV', msg.k);
                break;

            default:
                require('inspector').console.error(
                    'Unsupported event on payload:',
                );
                require('inspector').console.error(msg);
        }
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

        require('inspector').console.log('-> OUT');
        require('inspector').console.log(msg);
        require('inspector').console.log('');

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
