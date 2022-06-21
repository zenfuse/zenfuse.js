const { Bitglobal, errorCodes } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');
const BitglobalApiError = require('../../../src/exchanges/bitglobal/errors/api.error');

if (isEnd2EndTest) {
    checkProcessHasVariables(['BITGLOBAL_PUBLIC_KEY', 'BITGLOBAL_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = createEnv({
    API_PUBLIC_KEY: process.env.BITGLOBAL_PUBLIC_KEY,
    API_PRIVATE_KEY: process.env.BITGLOBAL_SECRET_KEY,
    NOT_EXECUTABLE_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0005,
        price: 35000,
    },
    BUY_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'buy',
        quantity: 0.0001,
        price: -1,
    },
    SELL_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'sell',
        quantity: 0.0001,
        price: -1,
    },
    BUY_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0004,
        price: 35000,
    },
    SELL_LIMIT_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'sell',
        quantity: 0.0001,
        price: 55000,
    },
    PRICE_SUBSCRIPTION: {
        channel: 'price',
        symbol: 'BTC/USDT',
    },
    CANDLE_SUBSCRIPTION: {
        channel: 'candle',
        symbol: 'BTC/USDT',
        interval: '1m',
    },
});

global.httpScope = createScope(env);

masterTest(Bitglobal, env);

describe('Error Handling', () => {
    describe('INVALID_CREDENTIALS code', () => {
        it('should throw INVALID_CREDENTIALS', async () => {
            try {
                await new Bitglobal.spot()
                    .auth({
                        publicKey: 'invalidPublicKey',
                        privateKey: 'invalidSecretKey',
                    })
                    .privateFetch('spot/assetList', {
                        method: 'POST',
                        json: {
                            assetType: 'spot',
                        },
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BitglobalApiError);
                expect(e.code).toBe(errorCodes.INVALID_CREDENTIALS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('INSUFFICIENT_FUNDS code', () => {
        it('should throw INSUFFICIENT_FUNDS', async () => {
            try {
                await new Bitglobal.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('spot/placeOrder', {
                        method: 'POST',
                        json: {
                            symbol: 'BTC-USDT',
                            side: 'sell',
                            type: 'limit',
                            quantity: 1,
                            price: 50000,
                        },
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BitglobalApiError);
                expect(e.code).toBe(errorCodes.INSUFFICIENT_FUNDS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('UNKNOWN_EXCEPTION code', () => {
        it('should throw UNKNOWN_EXCEPTION', async () => {
            try {
                await new Bitglobal.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('spot/openOrders', {
                        method: 'POST',
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BitglobalApiError);
                expect(e.code).toBe(errorCodes.UNKNOWN_EXCEPTION);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });
});
