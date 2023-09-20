const nock = require('nock');
const { readFileSync } = require('fs');

require('dotenv').config();

module.exports = async () => {
    process.env.ZENFUSE_DEBUG = 'true';

    const testMode = process.env.TEST_MODE;

    process.stdout.write('\n\n');

    switch (testMode) {
        case 'e2e':
            exitIfExchangeUnspecified()

            /** @see https://github.com/nock/nock#turning-nock-off-experimental */
            process.env.NOCK_OFF = 'true';

            nock.enableNetConnect();
            break;
        case 'unit':
        case 'integration':
            nock.disableNetConnect();
            break;
    }
};

const exitIfExchangeUnspecified = () => {
    if (process.argv.length > 4) return;

    const banner = readFileSync('tests/assets/unsecure.ascii');
    process.stderr.write(`\n\n\x1b[1m\x1b[33m${banner}\x1b[0m\n\n`);
    process.exit(1);
};
