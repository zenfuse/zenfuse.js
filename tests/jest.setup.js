const { matchers } = require('jest-json-schema');

expect.extend(matchers);

const TEST_TIMEOUT = 5000;

global.isEnd2EndTest = process.env.TEST_MODE === 'e2e';
global.isIntegrationTest = !global.isEnd2EndTest;

jest.setTimeout(TEST_TIMEOUT);
