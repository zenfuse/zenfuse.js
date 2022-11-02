const OkxWsBase = require('./websocketBase');

describe('transformOkxOrder()', () => {
    const OrderSchema = require('../../../base/schemas/openOrder');

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

        const result = OkxWsBase.prototype.transformOkxOrder(okxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
        expect(result).toStrictEqual(expectation);
    });
});
