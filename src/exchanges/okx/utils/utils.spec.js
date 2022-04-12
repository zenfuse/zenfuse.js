const utils = require('.');

describe('createHmacSignature()', () => {
    const { createHmacSignature } = utils;

    it('should return valid signature', () => {
        const params = {
            ts: 1588591511721,
            method: 'GET',
            path: '/api/v5/market/tickers',
        };

        const key = '0b3695c7-94d8-4d9e-8d40-e442a94dd90f';
        const signature = 'MdQTOHiC6aAfDCjy+9ZV4/dqY4tZDpPn5cJrYk7VUxM=';
        const trueSign = createHmacSignature(params, key);

        expect(trueSign).toBe(signature);
    });

    it('should return valid signature with body', () => {
        const params = {
            method: 'POST',
            body: {
                market: 'BTC-PERP',
                side: 'buy',
                price: 8500,
                size: 1,
                type: 'limit',
                reduceOnly: false,
                ioc: false,
                postOnly: false,
                clientId: null,
            },
            path: '/api/orders',
            ts: 1588591856950,
        };

        const key = 'T4lPid48QtjNxjLUFOcUZghD7CUJ7sTVsfuvQZF2';
        const signature = 'KDLYU+VdtxX1mqrdlmzcUZE5Z9qL9oeq2EV6WsYJMT4=';
        const trueSign = createHmacSignature(params, key);

        expect(trueSign).toBe(signature);
    });
});

describe('transformZenfuseOrder()', () => {
    const { transformZenfuseOrder } = utils;

    it('should transform limit order', () => {
        const order = {
            symbol: 'BTC-USDT',
            side: 'buy',
            type: 'limit',
            price: '69.6969',
            quantity: '0.02323',
            extra: 'whenbinance',
        };

        const expectation = {
            instId: 'BTC-USDT',
            tdMode: 'cash',
            side: 'buy',
            ordType: 'limit',
            px: '69.6969',
            sz: '0.02323',
            extra: 'whenbinance',
        };

        expect(transformZenfuseOrder(order)).toStrictEqual(expectation);
    });
});

describe('transformOkxOrder()', () => {
    const { transformOkxOrder } = utils;

    const OrderSchema = require('../../../base/schemas/openOrder');

    it('should transform order', () => {
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

        const result = transformOkxOrder(okxCreatedOrder);

        expect(result).toMatchSchema(OrderSchema);
    });
});
