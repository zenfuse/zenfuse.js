const { EventEmitter } = require('events');
const { WebSocket } = require('ws');
const { gunzip } = require('zlib');
// const ZenfuseRuntimeError = require('../../../base/errors/runtime.error');

class HuobiWebsocketBase extends EventEmitter {
    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super();
        this.base = baseInstance;
    }

    getSocketConnection(path) {
        const { wsClientOptions } = this.base.options;

        const url = new URL(path, wsClientOptions.prefixUrl);

        const socket = new WebSocket(url, wsClientOptions);

        return new Promise((resolve, reject) => {
            socket.once('error', (err) => reject(err));

            socket.once('open', () => {
                socket.removeAllListeners('error');
                socket.on('error', this.handleConnectionError.bind(this));
                resolve(socket);
            });
        });
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

    checkSocketIsConnected() {
        if (!this.isSocketConnected) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }

    handleConnectionError(err) {
        throw err; // TODO: Websocket connection error
    }

    get isSocketConnected() {
        if (!this.socket) return false;

        return this.socket.readyState === WebSocket.OPEN;
    }

    unzip(buffer) {
        return new Promise((resolve, reject) => {
            gunzip(buffer, (err, dezipped) => {
                if (err) reject(err);

                resolve(dezipped.toString());
            });
        });
    }

    /**
     * Transforms websocket order from huobi
     * Huobi -> Zenfuse
     *
     * @param {object} wsOrder
     * @typedef {import('../../..').Order} Order
     * @private
     * @returns {Order} Zenfuse Order
     */
    transformWebsocketOrder(wsOrder) {
        const parsedSymbol = this.base.parseHuobiSymbol(wsOrder.symbol);

        //TODO: Update cached order with received order info
        // TODO: Add type for wsOrder
        switch (wsOrder.eventType) {
            case 'creation':
                return {
                    id: wsOrder.clientOrderId,
                    timestamp: wsOrder.orderCreateTime,
                    status: 'open',
                    symbol: parsedSymbol,
                    type: wsOrder.type.split('-')[1],
                    side: wsOrder.type.split('-')[0],
                    price: parseFloat(wsOrder.orderPrice),
                    quantity: parseFloat(wsOrder.orderSize),
                };
            // case 'deletion':
            //     const cachedOrder = this.base.cache.getCachedOrderById(
            //         wsOrder.clientOrderId,
            //     );
            //     if (!cachedOrder) {
            //         throw new ZenfuseRuntimeError(
            //             `Order with ${wsOrder.clientOrderId} id does not exists`,
            //             'ZEFU_ORDER_NOT_FOUND',
            //         );
            //     }
            //     return {
            //         id: wsOrder.clientOrderId,
            //         timestamp: wsOrder.lastActTime,
            //         status: 'canceled',
            //         symbol: parsedSymbol,
            //         type: cachedOrder.type,
            //         side: cachedOrder.side,
            //         price: cachedOrder.price,
            //         quantity: cachedOrder.quantity,
            //     };
            case 'trade':
                return {
                    id: wsOrder.clientOrderId,
                    timestamp: wsOrder.tradeTime,
                    status: 'closed',
                    symbol: parsedSymbol,
                    type: wsOrder.type.split('-')[1],
                    side: wsOrder.type.split('-')[0],
                    price: wsOrder.tradePrice,
                    quantity: wsOrder.tradeVolume,
                };
            default:
                return;
        }
    }
}

module.exports = HuobiWebsocketBase;
