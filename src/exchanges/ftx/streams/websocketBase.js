const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class FtxWebsocketBase extends EventEmitter {
    static PING_INTERVAL = 15000; // 15 sec

    /**
     * @type {NodeJS.Timeout}
     */
    pingInterval;

    /**
     * @type {import('ws').WebSocket}
     */
    socket;

    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;
        this.setMaxListeners(Infinity);
    }

    /**
     * Opens websocket connection
     * @returns {Promice<void>}
     */
    open() {
        const { wsClientOptions } = this.base.options;

        const url = new URL('ws', wsClientOptions.prefixUrl);

        const socket = new WebSocket(url, wsClientOptions);

        return new Promise((resolve, reject) => {
            socket.once('error', (err) => reject(err));

            socket.once('open', () => {
                socket.removeAllListeners('error');
                this.socket = socket;
                this.socket.on('error', this.handleConnectionError.bind(this));

                this.pingInterval = setInterval(() => {
                    this.socket.send('{"op": "ping"}');
                }, FtxWebsocketBase.PING_INTERVAL);

                resolve();
            });
        });
    }

    /**
     * @returns {this}
     */
    close() {
        if (this.isSocketConneted) {
            clearInterval(this.pingInterval);
            this.socket.close();
        }

        return this;
    }

    handleConnectionError(err) {
        throw err; // TODO: Websocket connection error
    }

    checkSocketIsConneted() {
        if (!this.isSocketConneted) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
    }

    /**
     * @typedef {object} WebsocketEvent
     * @property {string} channel
     * @property {string} symbol
     * @property {string} [interval] Required if channel is kline
     * @property {string} channel
     *
     * @param {string|WebsocketEvent} event
     */
    async subscribeTo(event) {
        this.checkSocketIsConneted();

        if (event.channel === 'kline') {
        }

        throw new Error('Unsupported channel' + event.channel);
    }

    /**
     * @param {string|WebsocketEvent} event
     */
    async unsubscribeFrom(event) {}
}

module.exports = FtxWebsocketBase;
