const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Huobi } = require('zenfuse');

if (isEnd2EndTest) {
    checkProcessHasVariables(['HUOBI_PUBLIC_KEY', 'HUOBI_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = {
    API_PUBLIC_KEY: process.env.HUOBI_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_PRIVATE_KEY: process.env.HUOBI_SECRET_KEY || 'DUMMY_SECRET_KEY',
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDT/USD',
        type: 'limit',
        side: 'buy',
        quantity: 20,
        price: 0.5,
    },
};

global.httpScope = createScope(env);

masterTest(Huobi, env);
