const nock = require('nock');
const { matchers } = require('jest-json-schema');

expect.extend(matchers);

const isEnd2EndTest = process.env.MOCK_HTTP === 'false';

const TEST_TIMEOUT = 5000;

if (isEnd2EndTest) {
    process.stdout.write('\x1b[43m\x1b[30m THIS IS E2E TEST \x1b[0m\n\n');

    /** @see https://github.com/nock/nock#turning-nock-off-experimental */
    process.env.NOCK_OFF = 'true';

    nock.enableNetConnect();
} else {
    nock.disableNetConnect();
}

jest.setTimeout(TEST_TIMEOUT);

process.on('unhandledRejection', (error) => {
    console.error('unhandledRejection', error.message);
    process.exit(1);
});
