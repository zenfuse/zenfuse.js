const nock = require('nock');

require('dotenv').config();

module.exports = () => {
    const testMode = process.env.TEST_MODE;

    if (testMode === 'e2e') {
        process.stdout.write('\n\n\x1b[45m\x1b[30m E2E TEST \x1b[0m\n\n');

        /** @see https://github.com/nock/nock#turning-nock-off-experimental */
        process.env.NOCK_OFF = 'true';

        nock.enableNetConnect();
        return;
    }

    if (testMode === 'integration') {
        process.stdout.write(
            '\n\n\x1b[44m\x1b[30m INTEGRATION TEST \x1b[0m\n\n',
        );

        nock.disableNetConnect();
        return;
    }

    if (testMode === 'unit') {
        process.stdout.write('\n\n\x1b[47m\x1b[30m UNIT TEST \x1b[0m\n\n');

        nock.disableNetConnect(); // ¯\_(ツ)_/¯
        return;
    }

    throw new Error('Invalid TEST_MODE variable =>', testMode);
};
