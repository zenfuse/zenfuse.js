const { FTX } = require('zenfuse');

const masterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const createEnv = require('../../helpers/createEnv');

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
});

global.httpScope = createScope(env);

masterTest(FTX, env);
