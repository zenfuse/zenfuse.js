const { OKX, errorCodes } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const OkxApiException = require('../../../src/exchanges/okx/errors/api.error');

if (isEnd2EndTest) {
    checkProcessHasVariables([
        'OKX_PUBLIC_KEY',
        'OKX_SECRET_KEY',
        'OKX_PASSPHRASE',
    ]);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = {
    API_PUBLIC_KEY: process.env.OKX_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_PRIVATE_KEY: process.env.OKX_SECRET_KEY || 'DUMMY_SECRET_KEY',
    API_ADD_KEY: process.env.OKX_PASSPHRASE || 'DUMMY_ADD_KEY',
    NOT_EXECUTABLE_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0005,
        price: 35000,
    },
    CANDLES_REQUEST: {
        symbol: 'BTC/USDT',
        interval: '1m',
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
};

global.httpScope = createScope(env);

// masterTest(OKX, env);

describe('Error Handling', () => {
    describe('INVALID_CREDENTIALS code', () => {
        it('should throw INVALID_CREDENTIALS', async () => {
            try {
                await new OKX.spot()
                    .auth({
                        publicKey: 'invalidPublicKey',
                        privateKey: 'invalidSectetKey',
                        addKey: 'invalidAddKey',
                    })
                    .privateFetch('api/v5/trade/orders-pending')
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                console.log(e);
                expect(e).toBeInstanceOf(OkxApiException);
                expect(e.code).toBe(errorCodes.INVALID_CREDENTIALS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('INSUFFICIENT_FUNDS code', () => {
        it('should throw INSUFFICIENT_FUNDS', async () => {
            try {
                await new OKX.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                        addKey: env.API_ADD_KEY,
                    })
                    .privateFetch('api/v5/trade/order', {
                        method: 'POST',
                        json: {
                            instId: 'ELON-USDT',
                            tdMode: 'cash',
                            clOrdId: 'b15',
                            side: 'sell',
                            ordType: 'limit',
                            px: '0.00000099595',
                            sz: '9999999999999',
                        },
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                console.log(e);
                expect(e).toBeInstanceOf(OkxApiException);
                expect(e.code).toBe(errorCodes.INSUFFICIENT_FUNDS);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });

    describe('UNKNOWN_EXEPTION code', () => {
        it('should throw UNKNOWN_EXEPTION', async () => {
            try {
                await new OKX.spot()
                    .auth({
                        publicKey: env.API_PUBLIC_KEY,
                        privateKey: env.API_PRIVATE_KEY,
                        addKey: env.API_ADD_KEY,
                    })
                    .privateFetch('api/v5/account/set-leverage', {
                        method: 'POST',
                    })
                    .then((body) => {
                        // eslint-disable-next-line no-console
                        console.error(body);
                        throw 'Not caught';
                    });
            } catch (e) {
                console.log(e);
                expect(e).toBeInstanceOf(OkxApiException);
                expect(e.code).toBe(errorCodes.UNKNOWN_EXEPTION);
                expect(e.message).toBeDefined();
                expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
            }
        });
    });
});
