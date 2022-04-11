const nock = require('nock');
const { readFileSync } = require('fs');

require('dotenv').config();

module.exports = async () => {
    process.env.ZENFUSE_DEBUG = 'true';

    const testMode = process.env.TEST_MODE || 'unit';

    if (testMode === 'e2e') {
        if (process.argv.length === 4) {
            const banner = readFileSync('tests/assets/unsecure.ascii');
            process.stderr.write(`\n\n\x1b[1m\x1b[33m${banner}\x1b[0m\n\n`);
            process.exit(1);
        }

        process.stdout.write('\n\n\x1b[43m\x1b[30m E2E TEST \x1b[0m\n');
        process.stdout.write(
            '\x1b[1m\x1b[40m\x1b[33m COMMISSION INCLUDED! \x1b[0m\n\n',
        );

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
};
