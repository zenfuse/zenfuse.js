const { createHmac } = require('crypto');

const utils = require('../utils');
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
        .digest('hex');

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
    //TODO: check all below
    serverMessageHandler(msgString) {
        
        const payload = JSON.parse(msgString);
        console.log(payload);
        if (payload.topic === 'ORDER') {
            this.emitOrderUpdateEvent(payload);
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = utils.transformBithumbOrderWS(payload);

        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }
}

module.exports = AccountDataStream;
