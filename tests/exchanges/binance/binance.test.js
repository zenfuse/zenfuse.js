const { Binance, errorCodes } = require('zenfuse');

// const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');
const BinanceApiExeption = require('../../../src/exchanges/binance/errors/api.error');

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
        quantity: 20,
        price: 0.8,
    },
});

global.httpScope = createScope(env);

// masterTest(Binance, env);

describe('Error Handling', () => {
    it('should throw INVALID_CREDENTIALS', async () => {
        try {
            await new Binance.spot()
                .auth({
                    publicKey: 'invalidPublicKey',
                    privateKey: 'invalidSectetKey',
                })
                .privateFetch('api/v3/openOrders');
        } catch (e) {
            expect(e).toBeInstanceOf(BinanceApiExeption);
            expect(e.code).toBe(errorCodes.INVALID_CREDENTIALS);
            expect(e.message).toBeDefined();
            expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
        }
    });

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
                });
        } catch (e) {
            expect(e).toBeInstanceOf(BinanceApiExeption);
            expect(e.code).toBe(errorCodes.INSUFFICIENT_FUNDS);
            expect(e.message).toBeDefined();
            expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
        }
    });

    it('should throw UNKNOWN_EXEPTION', async () => {
        try {
            await new Binance.spot()
                .auth({
                    publicKey: env.API_PUBLIC_KEY,
                    privateKey: env.API_PRIVATE_KEY,
                })
                .privateFetch('api/v3/myTrades');
        } catch (e) {
            expect(e).toBeInstanceOf(BinanceApiExeption);
            expect(e.code).toBe(errorCodes.UNKNOWN_EXEPTION);
            expect(e.message).toBeDefined();
            expect(e[Symbol.for('zenfuse.originalPayload')]).toBeDefined();
        }
    });
});
