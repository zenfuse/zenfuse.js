const runMasterTest = require('../../master.test');
const createScope = require('./scope');
const checkProcessHasVariables = require('../../helpers/validateEnv');
const { FTX } = require('../../../src/index.js'); // zenfuse itself

if (isEnd2EndTest) {
    checkProcessHasVariables(['FTX_PUBLIC_KEY', 'FTX_SECRET_KEY']);
}

const env = {
    API_PUBLIC_KEY: process.env.FTX_PUBLIC_KEY || 'DUMMY_PUBLIC_KEY',
    API_SECRET_KEY: process.env.FTX_SECRET_KEY || 'DUMMY_SECRET_KEY',
};

global.httpScope = createScope(env);

runMasterTest(FTX, env);
