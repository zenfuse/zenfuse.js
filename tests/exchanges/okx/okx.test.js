const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { OKX } = require('zenfuse');

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
    API_PRIVATE_KEY: process.env.OKX_PASSPHRASE || 'DUMMY_PASSPHRASE',
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDT/USD',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.5,
    },
};

global.httpScope = createScope(env);

masterTest(OKX, env);
