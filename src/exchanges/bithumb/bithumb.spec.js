const { Bithumb } = require('zenfuse');

let exchange = new Bithumb['spot']();
let stream = exchange.getAccountDataStream();

describe('createHmacSignatureBithumb()', () => {
    it('should return valid signature', () => {
        const params = {
            apiKey: '484bd71d59d5ed29ff3c27a6d0c6754c',
            ts: 1588591511721,
            msgNo: 1,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const encoding = 'hex';
        const madeSign = exchange.createHmacSignatureBithumb(
            params,
            key,
            encoding,
        );
        const signature =
            '9c5bd5874218fb8ed252b8c14e411600b6be3f53d56c266224131c545dfca0e4';

        expect(madeSign).toBe(signature);
    });
});

describe('transformZenfuseOrder()', () => {
    it('should transform limit order', () => {
        const order = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
        };

        const expectation = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC-ETH',
            side: 'buy',
            type: 'limit',
            price: '69.6969',
            quantity: '0.02323',
        };

        expect(exchange.transformZenfuseOrder(order)).toStrictEqual(
            expectation,
        );
    });
});

describe('transformBithumbOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

    it('should transform created order', () => {
        const zenfuseCreatedOrder = {
            id: '123',
            timestamp: 1588591856950,
            status: 'open',
            symbol: 'BTC/ETH',
            side: 'buy',
            type: 'limit',
            price: 69.6969,
            quantity: 0.02323,
        };
        const receivedBithumbOrder = {
            data: {
                orderId: '23132134242',
                symbol: 'BTC-ETH',
            },
            code: '0',
            msg: 'success',
            timestamp: 1551346473238,
            params: [],
        };

        const result = exchange.transformBithumbOrder(
            receivedBithumbOrder,
            zenfuseCreatedOrder,
        );

        expect(result).toMatchSchema(OrderSchema);
    });

    it('should transform fetched order', () => {
        const receivedBithumbOrder = {
            data: {
                orderId: '12300993210',
                symbol: 'BTC-USDT',
                price: '3700',
                tradedNum: '0.01',
                quantity: '0.5',
                avgPrice: '0',
                status: 'pending',
                type: 'limit',
                side: 'buy',
                createTime: '1552878781',
                tradeTotal: '0.5',
            },
            code: '0',
            msg: 'success',
            timestamp: 1551346473238,
            params: [],
        };

        const result = exchange.transformBithumbOrder(receivedBithumbOrder);

        expect(result).toMatchSchema(OrderSchema);
    });

    it('should transform WS format order', () => {
        const receivedBithumbOrder = {
            code: '00007',
            data: {
                cancelQuantity: '10060.7',
                dealPrice: '0',
                dealQuantity: '0',
                dealVolume: '0',
                fee: '0',
                feeType: '',
                oId: '69663509668139008',
                price: '100.607',
                quantity: '100',
                side: 'buy',
                status: 'canceled',
                symbol: 'BTC-USDT',
                time: 1560758352705,
                type: 'limit',
            },
            topic: 'ORDER',
            timestamp: 1560758352743,
        };

        const result = stream.transformBithumbOrderWS(receivedBithumbOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
