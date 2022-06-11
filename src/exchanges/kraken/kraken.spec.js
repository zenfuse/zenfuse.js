const KrakenBase = require('./base');

describe('createHmacSignatureKraken()', () => {
    it('should return valid signature', () => {
        const url = '0/private/AddOrder';

        const key = 'JBEAtwFsXNH0TVho4HRT0PvFrZvDqYYHk2ilDYIzbZzpw+nquF2Pw8TlS9NpOXU9yyNFhF5mDzTYnafGRkcSgw==';
        const body = {
            nonce: Date.now().toString(),
            pair: 'BTCUSDT',
            type: 'buy',
            ordertype: 'limit',
            price: '20000',
            volume: '1'
        };
        const madeSign = KrakenBase.prototype.createHmacSignatureKraken(
            url,
            body,
            key,
        );
        const signature =
            '9c5bd5874218fb8ed252b8c14e411600b6be3f53d56c266224131c545dfca0e4';

        expect(madeSign).toBe(signature);
    });
});

describe('transformZenfuseOrder()', () => {
    it('should transform limit order', () => {
        const order = {
            id: 1,
            symbol: 'BTC/USDT',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
            extra: 'whenbinance',
        };

        const expectation = {
            txid: '1',
            pair: 'BTCUSDT',
            type: 'buy',
            ordertype: 'limit',
            price: '69.6969',
            volume: '0.02323',
            extra: 'whenbinance',
        };

        expect(KrakenBase.prototype.transformZenfuseOrder(order)).toStrictEqual(
            expectation,
        );
    });
});

describe('transformKrakenOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

    it('should transform REST format order', () => {
        const KrakenCreatedOrder = {
            refid: null,
            userref: 0,
            status: "closed",
            reason: null,
            opentm: 1616665496.7808,
            closetm: 1616665499.1922,
            starttm: 0,
            expiretm: 0,
            descr: {
                pair: "XBTUSD",
                type: "buy",
                ordertype: "limit",
                price: "37500.0",
                price2: "0",
                leverage: "none",
                order: "buy 1.25000000 XBTUSD @ limit 37500.0",
                close: ""
            },
            vol: "1.25000000",
            vol_exec: "1.25000000",
            cost: "37526.2",
            fee: "37.5",
            price: "30021.0",
            stopprice: "0.00000",
            limitprice: "0.00000",
            misc: "",
            oflags: "fciq",
            trigger: "index",
            trades: [
            "TZX2WP-XSEOP-FP7WYR"
            ],
        };

        const expectation = {
            timestamp: 1616665496.7808,
            symbol: 'XBT/USDT',
            type: 'limit',
            side: 'buy',
            quantity: 1.25000000,
            price: 37500.0,
            status: 'open',
        };

        const result = KrakenBase.prototype.transformKrakenOrder(KrakenCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
        expect(result).toStrictEqual(expectation);
    });
});
