const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class BithumbWebsocketBase extends EventEmitter {
    static PING_INTERVAL = 15000; // 15 sec

    /**
     * @type {number}
     */
    pingIntervalId;

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
     *
     * @returns {Promise<void>}
     */
    open() {
        const { wsClientOptions } = this.base.options;

        const url = new URL('/message/realtime', wsClientOptions.prefixUrl);

        const socket = new WebSocket(url, wsClientOptions);

        return new Promise((resolve, reject) => {
            socket.once('error', (err) => reject(err));

            socket.once('open', () => {
                socket.removeAllListeners('error');
                this.socket = socket;
                this.socket.on('error', this.handleConnectionError.bind(this));

                this.pingIntervalId = setInterval(() => {
                    this.socket.send(JSON.stringify({ cmd: 'ping' }));
                }, BithumbWebsocketBase.PING_INTERVAL);

                resolve();
            });
        });
    }

    /**
     * @returns {this}
     */
    close() {
        if (this.isSocketConnected) {
            clearInterval(this.pingIntervalId);
            this.socket.close();
        }

        return this;
    }

    handleConnectionError(err) {
        throw err; // TODO: Websocket connection error
    }

    checkSocketIsConnected() {
        if (!this.isSocketConnected) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }

    get isSocketConnected() {
        if (!this.socket) return false;

        return this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * @param {object} msg
     * @returns {void}
     */
    sendSocketMessage(msg) {
        this.checkSocketIsConnected();

        const msgString = JSON.stringify(msg);

        this.socket.send(msgString);
    }
}

module.exports = BithumbWebsocketBase;
