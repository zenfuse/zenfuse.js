const utils = require('../utils');
const ExchangeWebsocketBase = require('./websocketBase');

const listenKeySymbol = Symbol('listenKey');
const validUntilSymbol = Symbol('validUntil');
const intervalSymbol = Symbol('interval');

class AccountDataStream extends ExchangeWebsocketBase {
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

        this[listenKeySymbol] = null;
        this[validUntilSymbol] = null;
    }

    /**
     *
     * @returns {this}
     */
    async open() {
        const listenKey = await this.fetchListenKey();

        this[listenKeySymbol] = listenKey;

        this.socket = await this.getSocketConnection(`/ws/${listenKey}`);

        this.createRevalidateInterval();

        this.socket.on('message', this.serverMessageHandler.bind(this));

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

        this.stopInterval();
        return this;
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * @private
     */
    async fetchListenKey() {
        const { listenKey } = await this.base.publicFetch(
            'api/v3/userDataStream',
            {
                method: 'POST',
            },
        );

        return listenKey;
    }

    /**
     * @private
     */
    createRevalidateInterval() {
        this[intervalSymbol] = setInterval(
            this.extendListenKey.bind(this),
            AccountDataStream.REVALIDATE_INTERVAL,
        );
    }

    /**
     * @private
     */
    stopInterval() {
        clearInterval(this[intervalSymbol]);
    }

    /**
     * @private
     */
    async extendListenKey() {
        await this.base.publicFetch('/api/v3/userDataStream', {
            method: 'PUT',
            searchParams: {
                listenKey: this[listenKeySymbol],
            },
        });

        this.extendValidityTime();
    }

    /**
     * @private
     */
    extendValidityTime() {
        this._validUntil = Date.now() + 3_600_000; // 60min
    }

    checkSocketIsConneted() {
        if (!this.isSocketConneted) {
            throw new Error('Socket not connected'); // TODO: Specific error
        }
    }

    serverMessageHandler(msgString) {
        const payload = JSON.parse(msgString);

        const eventName = payload.e;

        if (eventName === 'executionReport') {
            this.emitOrderUpdateEvent(payload);
        }

        this.emit('payload', payload);
    }

    emitOrderUpdateEvent(payload) {
        const order = this.transfromWebsocketOrder(payload);
        this.emit('orderUpdate', order);
    }

    /**
     * Transforms websocket order from binance
     * Binance -> Zenfuse
     *
     * @typedef {import('../../..').Order} Order
     * @private
     * @returns {Order} Zenfuse Order
     */
    transfromWebsocketOrder(wsOrder) {
        const parsedSymbol = this.base.parseBinanceSymbol(wsOrder.s);

        return {
            id: wsOrder.i.toString(),
            timestamp: wsOrder.E,
            status: wsOrder.X.toLowerCase(),
            symbol: parsedSymbol,
            type: wsOrder.o.toLowerCase(),
            side: wsOrder.S.toLowerCase(),
            price: parseFloat(wsOrder.p),
            quantity: parseFloat(wsOrder.q),
        };
    }
}

module.exports = AccountDataStream;
