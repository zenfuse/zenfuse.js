const { createHmac } = require('crypto');

const utils = require('../../../base/utils/utils');
const FtxWebsocketBase = require('./websocketBase');

class AccountDataStream extends FtxWebsocketBase {
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
     * @returns {Promise<this>}
     */
    async open() {
        await super.open();

        this.socket.on('message', this.serverMessageHandler.bind(this));

        const keysSymbol = Symbol.for('zenfuse.keyVault');
        const { publicKey, privateKey } = this.base[keysSymbol];
        const timestamp = Date.now();
        const signature = createHmac('sha256', privateKey)
            .update(`${timestamp}websocket_login`)
            .digest(this.signatureEncoding);

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
        const order = this.transformFtxOrder(payload.data);

        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }
}

module.exports = AccountDataStream;
