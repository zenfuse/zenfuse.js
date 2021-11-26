const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

const REVALIDATE_INTERVAL_TIME = 1_800_000; // 30min

class BinanceWebsocketBase extends EventEmitter {
    _listenKey = null;
    _validUntil = null;
    lastPayloadId = 0;

    /**
     * Messages that are waiting for a response with a specific id
     * @type {Map<string, [Promise.resolve, Promise.reject]>}
     */
    messageQueue;

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
        const listenKey = await this.fetchListenKey();

        this._listenKey = listenKey;

        this.socket = this.getSocketConnection(listenKey);

        return new Promise((resolve, reject) => {
            this.socket.once('error', (err) => reject(err));

            this.socket.once('open', () => {
                this.socket.removeAllListeners('error');
                this.socket.on('message', this.serverMessageHandler.bind(this));
                this.createRevalidateInterval();
                resolve(this);
            });
        });
    }

    /**
     *
     * @returns {this}
     */
    async close() {
        this.socket.close();
        this.stopInterval();
        return this;
    }

    getSocketConnection(path) {
        const url = new URL(`/ws/${path}`, this.base.options.websocketUrl);

        return new WebSocket(url);
    }

    /**
     * @protected
     */
    async fetchListenKey() {
        const { listenKey } = await this.base.publicFetch(
            'api/v3/userDataStream',
            {
                method: 'POST',
            },
        );

        return listenKey;
    }

    /**
     * @private
     */
    createRevalidateInterval() {
        this._interval = setInterval(
            this.extendListenKey.bind(this),
            REVALIDATE_INTERVAL_TIME,
        );
    }

    /**
     * @private
     */
    stopInterval() {
        clearInterval(this._interval);
    }

    /**
     * @private
     */
    async extendListenKey() {
        await this.base.publicFetch('/api/v3/userDataStream', {
            method: 'PUT',
            searchParams: {
                listenKey: this._listenKey,
            },
        });

        this.extendValidityTime();
    }

    /**
     * @private
     */
    extendValidityTime() {
        this._validUntil = Date.now() + 3_600_000; // 60min
    }

    checkSocketIsConneted() {
        if (!this.socket.connected) {
            throw new Error('Socket not connected');
        }
    }

    serverMessageHandler(msgString) {
        const payload = JSON.parse(msgString);

        if (!this.messageQueue.has(payload.id)) {
            throw new Error(
                'QUEUE UNSYNCED: Message queue does not have recieved id',
            );
        }

        const [resolve, reject] = this.messageQueue.get(payload.id);

        // TODO: Error handler

        resolve(payload);
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
}

module.exports = BinanceWebsocketBase;
