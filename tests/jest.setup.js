const nock = require('nock');
const { matchers } = require('jest-json-schema');

expect.extend(matchers);

const isEnd2EndTest = process.env.MOCK_HTTP === 'false';

const TEST_TIMEOUT = 5000;

if (isEnd2EndTest) {
    /** @see https://github.com/nock/nock#turning-nock-off-experimental */
    process.env.NOCK_OFF = 'true';
    nock.enableNetConnect();
} else {
    nock.disableNetConnect();
}

jest.setTimeout(TEST_TIMEOUT);
