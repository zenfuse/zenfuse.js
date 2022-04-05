const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Bithumb } = require('zenfuse');

if (isEnd2EndTest) {
    checkProcessHasVariables(['BITHUMB_PUBLIC_KEY', 'BITHUMB_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = {
    API_PUBLIC_KEY: process.env.BITHUMB_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_PRIVATE_KEY: process.env.BITHUMB_SECRET_KEY || 'DUMMY_SECRET_KEY',
    NOT_EXECUTABLE_ORDER: {
        symbol: 'BTC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 0.0005,
        price: 35000,
    },
};

global.httpScope = createScope(env);

masterTest(Bithumb, env);
