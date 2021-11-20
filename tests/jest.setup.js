const { matchers } = require('jest-json-schema');

expect.extend(matchers);

const TEST_TIMEOUT = 5000;

jest.setTimeout(TEST_TIMEOUT);
