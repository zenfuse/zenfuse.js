const FakeServer = require('mock-socket').Server;
const EventEmitter = require('events');

/**
 * Binance websocket server implementation to mock connection
 */
class BinanceWebsocketServer extends EventEmitter {
    table = new Map([
        [
            /{"method":"SUBSCRIBE","params":\["btcusdt@kline_1m"\],"id":\d+}/,
            (send, id) => {
                send(`{"result":null,"id":${id}}`);
                send(
                    '{"e":"kline","E":1673291494099,"s":"BTCUSDT","k":{"t":1673291460000,"T":1673291519999,"s":"BTCUSDT","i":"1m","f":2449626516,"L":2449628048,"o":"17339.63000000","c":"17339.32000000","h":"17340.44000000","l":"17337.52000000","v":"51.33462000","n":1533,"x":false,"q":"890082.20199380","V":"21.37481000","Q":"370619.22970370","B":"0"}}',
                );
            },
        ],
        [
            /{"method":"UNSUBSCRIBE","params":\["btcusdt@kline_1m"\],"id":\d+}/,
            (send, id) => {
                send(`{"result":null,"id":${id}}`);
            },
        ],
    ]);

    connections = [];

    constructor() {
        super();
        // NOTE: mock-socket doesn't support multiple paths
        this.servers = [
            // Basic binance path
            new FakeServer('wss://stream.binance.com:9443/ws'),
            // Binance account data stream by listen key
            new FakeServer(
                'wss://stream.binance.com:9443/ws/pqia91ma19a5s61cv6a81va65sdf19v8a65a1a5s61cv6a81va65sdf19v8a65a1',
            ),
        ];

        this.servers.forEach((h) => {
            h.on('connection', (socket) => {
                this.connections.push(socket);
                socket.on('message', (msg) => {
                    this.handleMessage(socket, msg);
                });
            });
        });
    }

    handleMessage(socket, msg) {
        const { id } = JSON.parse(msg);

        for (const [regex, respond] of this.table) {
            if (regex.test(msg)) {
                respond(socket.send.bind(socket), id);
            }
        }
    }

    /**
     * Sends executionReport after 100ms
     *
     * @param {*} b Binance order
     */
    async emitNewOrder(b) {
        console.log('emitNewOrder', b.symbol);
        // Wait 100ms
        await new Promise((r) => setTimeout(r, 100));

        const payload = JSON.stringify({
            e: 'executionReport', // Event type
            E: 1499405658658, // Event time
            s: b.symbol, // Symbol
            c: b.clientOrderId, // Client order ID
            S: b.side, // Side
            o: b.type, // Order type
            f: b.timeInForce, // Time in force
            q: '1.00000000', // Order quantity
            p: '0.10264410', // Order price
            P: '0.00000000', // Stop price
            d: 4, // Trailing Delta; This is only visible if the order was a trailing stop order.
            F: '0.00000000', // Iceberg quantity
            g: b.orderListId, // OrderListId
            C: '', // Original client order ID; This is the ID of the order being canceled
            x: 'NEW', // Current execution type
            X: b.status, // Current order status
            r: 'NONE', // Order reject reason; will be an error code.
            i: 5123847, // Order ID
            l: '0.00000000', // Last executed quantity
            z: '0.00000000', // Cumulative filled quantity
            L: '0.00000000', // Last executed price
            n: '0', // Commission amount
            N: null, // Commission asset
            T: b.transactTime, // Transaction time
            t: -1, // Trade ID
            I: 8641984, // Ignore
            w: true, // Is the order on the book?
            m: false, // Is this trade the maker side?
            M: false, // Ignore
            O: 1499405658657, // Order creation time
            Z: '0.00000000', // Cumulative quote asset transacted quantity
            Y: '0.00000000', // Last quote asset transacted quantity (i.e. lastPrice * lastQty)
            Q: '0.00000000', // Quote Order Qty
            D: 1668680518494, // Trailing Time; This is only visible if the trailing stop order has been activated.
            j: 1, // Strategy ID; This is only visible if the strategyId parameter was provided upon order placement
            J: 1000000, // Strategy Type; This is only visible if the strategyType parameter was provided upon order placement
            W: 1499405658657, // Working Time; This is only visible if the order has been placed on the book.
            V: 'NONE', // SelfTradePreventionMode
        });

        this.connections.forEach((socket) => {
            socket.send(payload);
        });
    }
}

module.exports = BinanceWebsocketServer;
