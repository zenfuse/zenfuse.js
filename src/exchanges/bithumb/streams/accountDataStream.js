const { createHmac } = require('crypto');

const utils = require('../../../base/utils/utils');
const BithumbWebsocketBase = require('./websocketBase');

class AccountDataStream extends BithumbWebsocketBase {
    /**
     * @type {import('ws').WebSocket}
     */
    socket;

    /**
     * @param {import('../base')} baseInstance
     */
    constructor(baseInstance) {
        super(baseInstance);
    }

    /**
     *
     * @returns {this}
     */
    async open() {
        await super.open();

        this.socket.on('message', this.serverMessageHandler.bind(this));

        const keysSymbol = Symbol.for('zenfuse.keyVault');
        const { publicKey, privateKey } = this.base[keysSymbol];
        const requestPath = '/message/realtime';
        const timestamp = Date.now().toString();
        const signString = [requestPath, timestamp, publicKey].join('');

        const signature = createHmac('sha256', privateKey)
            .update(signString)
            .digest(this.signatureEncoding);

        this.sendSocketMessage({
            cmd: 'authKey',
            args: [publicKey, timestamp, signature],
        });

        this.sendSocketMessage({
            cmd: 'subscribe',
            args: ['ORDER'],
        });

        return this;
    }

    serverMessageHandler(msgString) {
        const payload = JSON.parse(msgString);

        if (payload.code === '00007' && payload.topic === 'ORDER') {
            this.emitOrderUpdateEvent(payload);
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = this.transformBithumbOrderWS(payload);

        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }

    transformBithumbOrderWS(bOrder) {
        /**
         * @type {PlacedOrder}
         */
        const zOrder = {};

        zOrder.id = bOrder.data.oId;
        zOrder.timestamp = bOrder.timestamp;
        zOrder.symbol = bOrder.data.symbol.replace('-', '/');
        zOrder.type = bOrder.data.type;
        zOrder.side = bOrder.data.side;
        zOrder.quantity = parseFloat(bOrder.data.quantity);
        zOrder.price = parseFloat(bOrder.data.price);
        if (bOrder.data.status === 'fullDealt') {
            zOrder.status = 'close';
        } else if (
            bOrder.data.status === 'created' ||
            bOrder.data.status === 'partDealt'
        ) {
            zOrder.status = 'open';
        } else {
            zOrder.status = 'canceled';
        }
        // zOrder.trades = bOrder.fills; // TODO: Fill commision counter

        return zOrder;
    }
}

module.exports = AccountDataStream;
