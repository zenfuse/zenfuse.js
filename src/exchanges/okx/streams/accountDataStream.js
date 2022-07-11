const utils = require('../../../base/utils/utils');
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
     * @returns {Promise<this>}
     */
    async open() {
        await super.open('ws/v5/private');

        this.socket.on('message', this.serverMessageHandler.bind(this));

        const keysSymbol = Symbol.for('zenfuse.keyVault');
        const { publicKey, privateKey, additionalKey } = this.base[keysSymbol];
        const timestamp = Date.now() / 1000;
        const sigParams = {
            ts: timestamp,
            method: 'GET',
            path: '/users/self/verify',
            body: '',
        };
        const signature = utils.createHmacSignatureDefault(
            sigParams,
            privateKey,
            this.signatureEncoding,
        );

        this.sendSocketMessage({
            op: 'login',
            args: [
                {
                    apiKey: publicKey,
                    passphrase: additionalKey,
                    timestamp: timestamp,
                    sign: signature,
                },
            ],
        });

        await new Promise((resolve, reject) => {
            this.socket.on('message', (payload) => {
                if (payload.toString() === 'pong') return;

                payload = JSON.parse(payload);

                const isLoginEvent = payload.event && payload.event === 'login';

                if (isLoginEvent) {
                    if (payload.code === '0') {
                        resolve();
                    } else {
                        reject(payload); // TODO: Invalid credentials error
                    }
                }
            });
        });

        this.sendSocketMessage({
            op: 'subscribe',
            args: [
                {
                    channel: 'orders',
                    instType: 'SPOT',
                },
            ],
        });

        return this;
    }

    serverMessageHandler(msgString) {
        if (msgString.toString() === 'pong') return;

        const payload = JSON.parse(msgString);

        const isOrdersMessage =
            payload.arg && !payload.event && payload.arg.channel === 'orders';

        if (isOrdersMessage) {
            payload.data.forEach(this.emitOrderUpdateEvent.bind(this));
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = this.transformOkxOrder(payload);

        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }
}

module.exports = AccountDataStream;
