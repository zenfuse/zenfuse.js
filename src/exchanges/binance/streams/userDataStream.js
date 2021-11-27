const BinanceWebsocketBase = require('./websocketBase');

const REVALIDATE_INTERVAL_TIME = 1_800_000; // 30min

class UserDataStream extends BinanceWebsocketBase {
    _listenKey = null;
    _validUntil = null;

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
        const listenKey = await this.fetchListenKey();

        this._listenKey = listenKey;

        this.socket = await this.getSocketConnection(`ws/${listenKey}`); // TODO: Catch network error

        this.createRevalidateInterval();

        this.socket.on('message', this.serverMessageHandler.bind(this));

        return this; // TODO: Promise<this>
    }

    /**
     *
     * @returns {this}
     */
    async close() {
        if (this.isSocketConneted) {
            this.socket.close();
        }

        this.stopInterval();
        return this;
    }

    get isSocketConneted() {
        if (!this.socket) return false;

        return this.socket.readyState === 1;
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
        this._interval = setInterval(
            this.extendListenKey.bind(this),
            REVALIDATE_INTERVAL_TIME,
        );
    }

    /**
     * @private
     */
    stopInterval() {
        clearInterval(this._interval);
    }

    /**
     * @private
     */
    async extendListenKey() {
        await this.base.publicFetch('/api/v3/userDataStream', {
            method: 'PUT',
            searchParams: {
                listenKey: this._listenKey,
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

        // TODO: listStatus event support

        // TODO: balanceChanged event

        switch (eventName) {
            case 'executionReport':
                this.emitOrderUpdateEvent(payload);
                break;
            case 'outboundAccountPosition':
                this.emitTickersChangedEvent(payload);
                break;
            default:
                throw payload;
        }
    }

    emitOrderUpdateEvent(payload) {
        const eventObject = {
            originalPayload: payload, // TODO: Same interface
        };

        this.emit('orderUpdate', eventObject);
    }

    emitTickersChangedEvent(payload) {
        const eventObject = {
            originalPayload: payload, // TODO: Same interface
        };

        this.emit('tickersChanged', eventObject);
    }
}

module.exports = UserDataStream;
