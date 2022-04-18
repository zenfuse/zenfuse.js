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
        await super.open('ws/v5/private');

        this.socket.on('message', this.serverMessageHandler.bind(this));

        const keysSymbol = Symbol.for('zenfuse.keyVault');
        const { publicKey, privateKey, addKey } = this.base[keysSymbol];
        const timestamp = Date.now() / 1000;
        const sigParams = {
            ts: timestamp,
            method: 'GET',
            path: '/users/self/verify',
            body: '',
        };
        const signature = utils.createHmacSignature(sigParams, privateKey);

        this.sendSocketMessage({
            op: 'login',
            args: [
                {
                    apiKey: publicKey,
                    passphrase: addKey,
                    timestamp: timestamp,
                    sign: signature,
                },
            ],
        });

        const loginPromise = new Promise((resolve) => {
            this.socket.on('message', (payload) => {
                if (payload.toString() !== 'pong') {
                    payload = JSON.parse(payload);
                    if (payload.event) {
                        if (payload.event === 'login' && payload.code === '0') {
                            resolve();
                        }
                    }
                }
            });
        });

        await loginPromise.then(() => {
            this.sendSocketMessage({
                op: 'subscribe',
                args: [
                    {
                        channel: 'orders',
                        instType: 'SPOT',
                    },
                ],
            });
        });

        return this;
    }

    serverMessageHandler(msgString) {
        if (msgString.toString() !== 'pong') {
            const payload = JSON.parse(msgString);

            console.log(payload);

            if (payload.arg && !payload.event) {
                if (payload.arg.channel === 'orders') {
                    this.emitOrderUpdateEvent(payload);
                }
            }

            this.emit('payload', payload);
        }
    }

    emitOrderUpdateEvent(payload) {
        //Code for multiple orders in one ws message

        // const orders = payload.data.map((order) => {
        //     utils.transformOkxOrder(order);
        // });

        const order = utils.transformOkxOrder(payload);
        utils.linkOriginalPayload(order, payload);

        this.emit('orderUpdate', order);
    }
}

module.exports = AccountDataStream;
