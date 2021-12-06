const BinanceWebsocketBase = require('./websocketBase');

class MarketDataStream extends BinanceWebsocketBase {
    lastPayloadId = 0;

    /**
     * @type {import('ws').WebSocket}
     */
    socket;

    /**
     * Messages that are waiting for a response with a specific id
     * @type {Map<string, [VoidFunction, VoidFunction]>}
     */
    messageQueue = new Map();

    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;

        this.messageQueue = new Map();
    }

    /**
     *
     * @returns {this}
     */
    async open() {
        this.socket = await this.getSocketConnection('ws');

        this.socket.on('message', this.serverMessageHandler.bind(this));

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

    serverMessageHandler(payload) {
        const msg = JSON.parse(payload);

        if (!msg.id) {
            throw new Error('Server payload does not have id');
        }

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
    }

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

        return new Promise((resolve, reject) => {
            this.messageQueue.set(msg.id, [resolve, reject]);
        });
    }

    getActualPayloadId() {
        this.lastPayloadId = ++this.lastPayloadId;
        return this.lastPayloadId;
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
    }
}

module.exports = MarketDataStream;
