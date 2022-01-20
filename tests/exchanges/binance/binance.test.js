const runMasterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Binance } = require('zenfuse');

if (isEnd2EndTest) {
    checkProcessHasVariables(['BINANCE_PUBLIC_KEY', 'BINANCE_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = {
    API_PUBLIC_KEY: process.env.BINANCE_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_PRIVATE_KEY: process.env.BINANCE_SECRET_KEY || 'DUMMY_SECRET_KEY',
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.8,
    },
};

global.httpScope = createScope(env);

runMasterTest(Binance, env);
