const runMasterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { Binance } = require('../../../src/index.js'); // zenfuse itself

if (isEnd2EndTest) {
    checkProcessHasVariables(['BINANCE_PUBLIC_KEY', 'BINANCE_SECRET_KEY']);
}

const env = {
    API_PUBLIC_KEY: process.env.BINANCE_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_SECRET_KEY: process.env.BINANCE_SECRET_KEY || 'DUMMY_SECRET_KEY',
};

global.httpScope = createScope(env);

runMasterTest(Binance, env);
