const nock = require('nock');

require('dotenv').config();

const validateEnvironment = () => {
    const requiredVars = [
        'BINANCE_SPOT_TESTNET_PUBLIC_KEY',
        'BINANCE_SPOT_TESTNET_SECRET_KEY',
    ];

    const errors = [];

    for (const variable of requiredVars) {
        if (!process.env[variable]) {
            const errorMsg = `${variable} environment variable is required`;
            errors.push(errorMsg);
        }
    }

    if (errors.length > 0) {
        console.log('\x1b[31mENVIRONMENT VALIDATION FAILED\x1b[0m\n');
        errors.forEach((msg) => console.log(msg));
        console.log('\nSpecify this in the .env file following .env.example\n');
        process.exit(1);
    }
};

module.exports = () => {
    const testMode = process.env.TEST_MODE;

    if (testMode === 'e2e') {
        process.stdout.write('\n\n\x1b[45m\x1b[30m E2E TEST \x1b[0m\n\n');
        validateEnvironment();

        /** @see https://github.com/nock/nock#turning-nock-off-experimental */
        process.env.NOCK_OFF = 'true';

        nock.enableNetConnect();
        return;
    }

    if (testMode === 'integration') {
        process.stdout.write(
            '\n\n\x1b[44m\x1b[30m INTEGRATION TEST \x1b[0m\n\n',
        );

        validateEnvironment();

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
