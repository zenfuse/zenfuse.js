const { FTX, errorCodes } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');
const FtxApiException = require('../../../src/exchanges/ftx/errors/api.error');

if (isEnd2EndTest) {
    checkProcessHasVariables(['FTX_PUBLIC_KEY', 'FTX_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = createEnv({
    API_PUBLIC_KEY: process.env.FTX_PUBLIC_KEY,
    API_PRIVATE_KEY: process.env.FTX_SECRET_KEY,
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDT/USD',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.5,
    },
    BUY_MARKET_ORDER: {
        symbol: 'USDT/USD',
        type: 'market',
        side: 'buy',
        quantity: 1,
    },
    SELL_MARKET_ORDER: {
        symbol: 'USDT/USD',
        type: 'market',
        side: 'sell',
        quantity: 1,
    },
    BUY_LIMIT_ORDER: {
        symbol: 'USDT/USD',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.5,
    },
    SELL_LIMIT_ORDER: {
        symbol: 'USDT/USD',
        type: 'limit',
        side: 'sell',
        quantity: 1,
        price: 1.5,
    },
    PRECISION_REQUIRED_ORDER: {
        symbol: 'DOGE/USD',
        side: 'buy',
        type: 'limit',
        quantity: 277.30303003,
        price: 0.03688849384834938,
    },
    PRECISION_IMPOSSIBLE_ORDER: {
        symbol: 'DOGE/USD',
        side: 'buy',
        type: 'limit',
        quantity: 0.1,
        price: 0.000000000000001,
    },
});

global.httpScope = createScope(env);

masterTest(FTX, env);

describe('Error Handling', () => {
    describe('INVALID_CREDENTIALS code', () => {
        it('should throw INVALID_CREDENTIALS', async () => {
            try {
                await new FTX.spot()
                    .auth({
                        publicKey: 'invalidPublicKey',
                        privateKey: 'invalidSecretKey',
                    })
                    .privateFetch('api/orders', {
                        searchParams: {
                            market: 'BTC-USD',
                        },
                    })
                    .then(() => {
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(FtxApiException);
                expect(e.code).toBe(errorCodes.INVALID_CREDENTIALS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('INSUFFICIENT_FUNDS code', () => {
        it('should throw INSUFFICIENT_FUNDS', async () => {
            try {
                await new FTX.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('api/orders', {
                        method: 'POST',
                        json: {
                            market: 'CREAM/USDT',
                            side: 'sell',
                            type: 'limit',
                            size: 999999,
                            price: 0.00003,
                        },
                    })
                    .then(() => {
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(FtxApiException);
                expect(e.code).toBe(errorCodes.INSUFFICIENT_FUNDS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('UNKNOWN_EXCEPTION code', () => {
        it('should throw UNKNOWN_EXCEPTION', async () => {
            try {
                await new FTX.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('api/orders/invalid_order_id/modify', {
                        method: 'POST',
                    })
                    .then(() => {
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(FtxApiException);
                expect(e.code).toBe(errorCodes.UNKNOWN_EXCEPTION);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });
});
