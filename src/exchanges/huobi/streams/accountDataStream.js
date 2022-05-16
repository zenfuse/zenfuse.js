const utils = require('../../../base/utils/utils');
const HuobiWebsocketBase = require('./websocketBase');
const { createHmac } = require('crypto');

class AccountDataStream extends HuobiWebsocketBase {
    /**
     * Time interval when zenfuse should revalidate listen key
     */
    static REVALIDATE_INTERVAL = 1_800_000; // 30min

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
        this.socket = await this.getSocketConnection('/ws/v2');

        this.socket.on('message', this.serverMessageHandler.bind(this));

        const keysSymbol = Symbol.for('zenfuse.keyVault');
        const { publicKey, privateKey } = this.base[keysSymbol];
        const timestamp = new Date().toISOString().replace(/.\d+Z$/g, '');
        const queryString = new URLSearchParams({
            accessKey: publicKey,
            signatureMethod: 'HmacSHA256',
            signatureVersion: 2.1,
            timestamp: timestamp,
        });
        const preSignedText = `GET\napi.huobi.pro\n/ws/v2\n${queryString.toString()}`;
        const signature = createHmac('sha256', privateKey)
            .update(preSignedText)
            .digest('base64');

        const authMsg = {
            authType: 'api',
            accessKey: publicKey,
            signatureMethod: 'HmacSHA256',
            signatureVersion: 2.1,
            timestamp: timestamp,
            signature: signature,
        };

        this.sendSocketMessage({
            action: 'req',
            ch: 'auth',
            params: authMsg,
        });

        this.sendSocketMessage({
            action: "sub",
            ch: "orders#*"
        });

        return this;
    }

    /**
     *
     * @returns {this}
     */
    close() {
        if (this.isSocketConneted) {
            this.socket.close();
        }
        return this;
    }

    serverMessageHandler(msgString) {
        const payload = JSON.parse(msgString);

        console.log(payload);

        const eventName = payload.action;

        if (eventName === 'ping') {
            this.sendPond(payload.data.ts);
        }
        if (eventName === 'push' && payload.ch.includes('orders')) {
            this.emitOrderUpdateEvent(payload.data);
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = this.transformWebsocketOrder(payload);
        this.emit('orderUpdate', order);
    }

    sendPond(timestamp) {
        const pong = {
            action: 'pong',
            data: {
                ts: timestamp,
            },
        };
        this.socket.send(JSON.stringify(pong));
    }
}

module.exports = AccountDataStream;
