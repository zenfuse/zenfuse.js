const OkxBase = require('./base');
const WsBase = require('./streams/websocketBase');

let exchange = new OkxBase({});
let stream = new WsBase();

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
            ordId: '1',
            instId: 'BTC-USDT',
            tdMode: 'cash',
            side: 'buy',
            ordType: 'limit',
            px: '69.6969',
            sz: '0.02323',
            extra: 'whenbinance',
        };

        expect(exchange.transformZenfuseOrder(order)).toStrictEqual(
            expectation,
        );
    });
});

describe('transformOkxOrder()', () => {
    const OrderSchema = require('../../base/schemas/openOrder');

    it('should transform REST format order', () => {
        const okxCreatedOrder = {
            instType: 'SPOT',
            instId: 'BTC-USDT',
            ccy: '',
            ordId: '312269865356374016',
            clOrdId: 'b1',
            tag: '',
            px: '999',
            sz: '3',
            pnl: '5',
            ordType: 'limit',
            side: 'buy',
            posSide: 'long',
            tdMode: 'isolated',
            accFillSz: '0',
            fillPx: '0',
            tradeId: '0',
            fillSz: '0',
            fillTime: '0',
            state: 'live',
            avgPx: '0',
            lever: '20',
            tpTriggerPx: '',
            tpTriggerPxType: 'last',
            tpOrdPx: '',
            slTriggerPx: '',
            slTriggerPxType: 'last',
            slOrdPx: '',
            feeCcy: '',
            fee: '',
            rebateCcy: '',
            rebate: '',
            tgtCcy: '',
            category: '',
            uTime: '1649288117964',
            cTime: '1649288117964',
        };

        const expectation = {
            id: '312269865356374016',
            timestamp: 1649288117964,
            symbol: 'BTC/USDT',
            type: 'limit',
            side: 'buy',
            quantity: 3,
            price: 999,
            status: 'open',
        };

        const result = exchange.transformOkxOrder(okxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
        expect(result).toStrictEqual(expectation);
    });

    it('should transform WS format order', () => {
        const okxCreatedOrder = {
            instType: 'SPOT',
            instId: 'BTC-USDT',
            ccy: '',
            ordId: '312269865356374016',
            clOrdId: 'b1',
            tag: '',
            px: '999',
            sz: '3',
            pnl: '5',
            ordType: 'limit',
            side: 'buy',
            posSide: 'long',
            tdMode: 'isolated',
            accFillSz: '0',
            fillPx: '0',
            tradeId: '0',
            fillSz: '0',
            fillTime: '0',
            state: 'live',
            avgPx: '0',
            lever: '20',
            tpTriggerPx: '',
            tpTriggerPxType: 'last',
            tpOrdPx: '',
            slTriggerPx: '',
            slTriggerPxType: 'last',
            slOrdPx: '',
            feeCcy: '',
            fee: '',
            rebateCcy: '',
            rebate: '',
            tgtCcy: '',
            category: '',
            uTime: '1649288117964',
            cTime: '1649288117964',
        };

        const expectation = {
            id: '312269865356374016',
            timestamp: 1649288117964,
            symbol: 'BTC/USDT',
            type: 'limit',
            side: 'buy',
            quantity: 3,
            price: 999,
            status: 'open',
        };

        const result = stream.transformOkxOrder(okxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
        expect(result).toStrictEqual(expectation);
    });
});
