const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class FtxWebsocketBase extends EventEmitter {
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
        this.signatureEncoding = 'hex';
    }

    /**
     * Opens websocket connection
     *
     * @returns {Promise<void>}
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

                this.pingIntervalId = setInterval(() => {
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

    /**
     * @typedef {import('../../../base/schemas/openOrder').PlacedOrder} PlacedOrder
     */

    transformFtxOrder(fOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = fOrder.id.toString();
        zOrder.timestamp = Date.parse(fOrder.createdAt);
        zOrder.symbol = fOrder.market;
        zOrder.type = fOrder.type;
        zOrder.side = fOrder.side;
        zOrder.quantity = parseFloat(fOrder.size);
        zOrder.price = fOrder.price ? parseFloat(fOrder.price) : undefined;
        // zOrder.trades = bOrder.fills; // TODO: Fill commission counter

        if (fOrder.status === 'new') {
            zOrder.status = 'open';
        } else {
            zOrder.status = fOrder.status;
        }

        return zOrder;
    }
}

module.exports = FtxWebsocketBase;
