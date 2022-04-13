const { Huobi } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');

if (isEnd2EndTest) {
    checkProcessHasVariables(['HUOBI_PUBLIC_KEY', 'HUOBI_SECRET_KEY']);
}

/**
 * @type {import('../../master.test').MasterTestEnvironment}
 */
const env = createEnv({
    API_PUBLIC_KEY: process.env.HUOBI_PUBLIC_KEY,
    API_PRIVATE_KEY: process.env.HUOBI_SECRET_KEY,
    NOT_EXECUTABLE_ORDER: {
        symbol: 'USDC/USDT',
        type: 'limit',
        side: 'buy',
        quantity: 10,
        price: 0.5,
    },
});

global.httpScope = createScope(env);

masterTest(Huobi, env);
