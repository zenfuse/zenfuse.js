const { createHmac } = require('crypto');

const utils = require('../utils');
const OkxWebsocketBase = require('./websocketBase');

class AccountDataStream extends OkxWebsocketBase {
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
        const timestamp = Date.now();
        const signature = createHmac('sha256', privateKey)
            .update(`${timestamp}websocket_login`)
            .digest('hex');

        this.sendSocketMessage({
            op: 'login',
            args: {
                key: publicKey,
                sign: signature,
                time: timestamp,
            },
        });

        this.sendSocketMessage({ op: 'subscribe', channel: 'orders' });

        return this;
    }

    serverMessageHandler(msgString) {
        const payload = JSON.parse(msgString);

        if (payload.type === 'update') {
            if (payload.channel === 'orders') {
                this.emitOrderUpdateEvent(payload);
            }
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = utils.transfromFtxOrder(payload.data);

        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }
}

module.exports = AccountDataStream;
