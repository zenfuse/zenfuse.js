const { EventEmitter } = require('events');
const { WebSocket } = require('ws');

class ExchangeWebsocketBase extends EventEmitter {
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

    handleConnectionError(err) {
        throw err; // TODO: Websocket connection error
    }

    /**
     * Transforms websocket order from binance
     * Binance -> Zenfuse
     *
     * @param {object} wsOrder
     * @typedef {import('../../..').Order} Order
     * @private
     * @returns {Order} Zenfuse Order
     */
    async transformWebsocketOrder(wsOrder) {
        const parsedSymbol = await this.base.parseBinanceSymbol(wsOrder.s);

        return {
            id: wsOrder.i.toString(),
            timestamp: wsOrder.E,
            // TODO: Refactor this
            status:
                wsOrder.X === 'NEW' || wsOrder.X === 'PARTIALLY_FILLED'
                    ? 'open'
                    : wsOrder.X === 'FILLED'
                    ? 'closed'
                    : 'canceled',
            symbol: parsedSymbol,
            type: wsOrder.o.toLowerCase(),
            side: wsOrder.S.toLowerCase(),
            price: parseFloat(wsOrder.p),
            quantity: parseFloat(wsOrder.q),
        };
    }

    /**
     * Transforms candlestick data from binance websocket
     *
     * @param {object} k candlestick data from binance websocket
     * @param {number} k.t Kline start time
     * @param {number} k.T Kline close time
     * @param {string} k.s Symbol
     * @param {string} k.i Interval
     * @param {number} k.f First trade ID
     * @param {number} k.L Last trade ID
     * @param {string} k.o Open price
     * @param {string} k.c Close price
     * @param {string} k.h High price
     * @param {string} k.l Low price
     * @param {string} k.v Base asset volume
     * @param {number} k.n Number of trades
     * @param {boolean} k.x Is this kline closed?
     * @param {string} k.q Quote asset volume
     * @param {string} k.V Taker buy base asset volume
     * @param {string} k.Q Taker buy quote asset volume
     * @param {string} k.B Ignore
     * @returns {import('../../../../index').Kline} Candlestick data
     */
    transformCandlestick(k) {
        return {
            open: parseFloat(k.o),
            high: parseFloat(k.h),
            low: parseFloat(k.l),
            close: parseFloat(k.c),
            timestamp: k.t,
            interval: k.i,
            isClosed: k.x,
            symbol: k.s,
            volume: parseFloat(k.v),
        };
    }
}

module.exports = ExchangeWebsocketBase;
