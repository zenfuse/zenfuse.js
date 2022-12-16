const { Binance, errorCodes } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');
const BinanceApiException = require('../../../src/exchanges/binance/errors/api.error');

if (isEnd2EndTest) {
    checkProcessHasVariables(['BINANCE_PUBLIC_KEY', 'BINANCE_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = createEnv({
    API_PUBLIC_KEY: process.env.BINANCE_PUBLIC_KEY,
    API_PRIVATE_KEY: process.env.BINANCE_SECRET_KEY,
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 15,
        price: 0.9,
    },
    BUY_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'buy',
        quantity: 0.0003,
    },
    SELL_MARKET_ORDER: {
        symbol: 'BTC/USDT',
        type: 'market',
        side: 'sell',
        quantity: 0.0003,
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
        quantity: 0.0003,
        price: 55000,
    },
    PRECISION_REQUIRED_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 400.30303003,
        price: 0.04688849384834938,
    },
    PRECISION_IMPOSSIBLE_ORDER: {
        symbol: 'DOGE/USDT',
        side: 'buy',
        type: 'limit',
        quantity: 0.1,
        price: 0.000000000000001,
    },
});

global.httpScope = createScope(env);

masterTest(Binance, env);

describe('Order precision', () => {
    it('should throw error on order values witch impossible to precise', async () => {
        await new Binance.spot()
            .auth({
                publicKey: env.API_PUBLIC_KEY,
                privateKey: env.API_PRIVATE_KEY,
            })
            .postOrder(env.PRECISION_IMPOSSIBLE_ORDER)
            .then((order) => {
                // eslint-disable-next-line no-console
                console.error('ORDER POSTED', order);
                throw 'Not caught';
            })
            .catch((err) => {
                expect(err.code).toBe('PRECISION_IMPOSSIBLE');
            });
    });
});

describe('Error Handling', () => {
    describe('INVALID_CREDENTIALS code', () => {
        it('should throw INVALID_CREDENTIALS', async () => {
            try {
                await new Binance.spot()
                    .auth({
                        publicKey: 'invalidPublicKey',
                        privateKey: 'invalidSecretKey',
                    })
                    .privateFetch('api/v3/openOrders')
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BinanceApiException);
                expect(e.code).toBe(errorCodes.INVALID_CREDENTIALS);
                expect(e.message).toBeDefined();
                expect(e.originalPayload).toBeDefined();
            }
        });
    });

    describe('INSUFFICIENT_FUNDS code', () => {
        it('should throw INSUFFICIENT_FUNDS', async () => {
            try {
                await new Binance.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('api/v3/order', {
                        method: 'POST',
                        searchParams: {
                            symbol: 'FUNBNB',
                            side: 'sell',
                            type: 'limit',
                            quantity: 999999,
                            price: 0.00003,
                            timeInForce: 'GTC',
                        },
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BinanceApiException);
                expect(e.code).toBe(errorCodes.INSUFFICIENT_FUNDS);
                expect(e.message).toBeDefined();
                expect(e.originalPayload).toBeDefined();
            }
        });
    });

    describe('UNKNOWN_EXCEPTION code', () => {
        it('should throw UNKNOWN_EXCEPTION', async () => {
            try {
                await new Binance.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                    })
                    .privateFetch('api/v3/myTrades')
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                expect(e).toBeInstanceOf(BinanceApiException);
                expect(e.code).toBe(errorCodes.UNKNOWN_EXCEPTION);
                expect(e.message).toBeDefined();
                expect(e.originalPayload).toBeDefined();
            }
        });
    });
});
