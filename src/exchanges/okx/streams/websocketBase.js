const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class OkxWebsocketBase extends EventEmitter {
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
     * @param {import('../wallets/spot')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;
        this.setMaxListeners(Infinity);
        this.signatureEncoding = 'base64';
    }

    /**
     * Opens websocket connection
     *
     * @param {string} path
     * @returns {Promise<void>}
     */
    open(path) {
        const { wsClientOptions } = this.base.options;

        const url = new URL(path, wsClientOptions.prefixUrl);

        const socket = new WebSocket(url, wsClientOptions);

        return new Promise((resolve, reject) => {
            socket.once('error', (err) => reject(err));

            socket.once('open', () => {
                socket.removeAllListeners('error');
                this.socket = socket;
                this.socket.on('error', this.handleConnectionError.bind(this));

                this.pingIntervalId = setInterval(
                    () => this.socket.send('ping'),
                    OkxWebsocketBase.PING_INTERVAL,
                );

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

    transformOkxOrder(xOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = xOrder.ordId;

        zOrder.timestamp = parseFloat(xOrder.cTime);
        zOrder.symbol = xOrder.instId.replace('-', '/');
        zOrder.type = xOrder.ordType;
        zOrder.side = xOrder.side;
        zOrder.quantity = parseFloat(xOrder.sz);

        if (xOrder.px) {
            zOrder.price = parseFloat(xOrder.px);
        }

        switch (xOrder.state) {
            case 'live':
            case 'partially_filled':
                zOrder.status = 'open';
                break;
            case 'filled':
                zOrder.status = 'close';
                break;
            default:
                zOrder.status = xOrder.state;
        }

        return zOrder;
    }
}

module.exports = OkxWebsocketBase;
